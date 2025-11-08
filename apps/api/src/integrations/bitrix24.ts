import pRetry from 'p-retry';

import env from '../config/env';
import prisma from '../lib/prisma';
import { logger } from '../middleware/logger';

export type Bitrix24FieldMapping = {
  title: string;
  name: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  serviceInterest?: string;
  source?: string;
  assignedById?: string;
  categoryId?: number;
  statusId?: string;
  customFields?: Record<string, any>;
};

export type Bitrix24Config = {
  webhookUrl: string;
  domain?: string;
  assignedById?: string;
  categoryId?: number;
  statusId?: string;
  sourceId?: string;
  currencyId?: string;
  customFields?: Record<string, string>;
  enableLogging?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
};

export type Bitrix24Response = {
  result?: {
    ID?: string;
    id?: number;
    [key: string]: any;
  };
  time?: {
    start: number;
    finish: number;
    duration: number;
  };
  error?: string;
  error_description?: string;
};

const BITRIX_ENABLED = Boolean(env.BITRIX24_WEBHOOK_URL) && !env.BITRIX24_USE_STUB;

const getBitrix24Config = (): Bitrix24Config => {
  return {
    webhookUrl: env.BITRIX24_WEBHOOK_URL!,
    domain: env.BITRIX24_DOMAIN,
    assignedById: env.BITRIX24_ASSIGNED_ID,
    categoryId: env.BITRIX24_CATEGORY_ID ? parseInt(env.BITRIX24_CATEGORY_ID) : undefined,
    statusId: env.BITRIX24_STATUS_ID || 'NEW',
    sourceId: env.BITRIX24_SOURCE_ID || 'WEB',
    currencyId: env.BITRIX24_CURRENCY_ID || 'KZT',
    customFields: env.BITRIX24_CUSTOM_FIELDS ? JSON.parse(env.BITRIX24_CUSTOM_FIELDS) : {},
    enableLogging: env.BITRIX24_ENABLE_LOGGING !== 'false',
    retryAttempts: env.BITRIX24_RETRY_ATTEMPTS ? parseInt(env.BITRIX24_RETRY_ATTEMPTS) : 3,
    retryDelay: env.BITRIX24_RETRY_DELAY ? parseInt(env.BITRIX24_RETRY_DELAY) : 1000,
  };
};

const prepareLeadPayload = (payload: Bitrix24FieldMapping, config: Bitrix24Config) => {
  const leadPayload: any = {
    fields: {
      TITLE: payload.title,
      NAME: payload.name,
      EMAIL: [{ VALUE: payload.email, VALUE_TYPE: 'WORK' }],
      SOURCE_ID: config.sourceId,
      CURRENCY_ID: config.currencyId,
    },
  };

  // Add optional fields
  if (payload.lastName) {
    leadPayload.fields.LAST_NAME = payload.lastName;
  }

  if (payload.phone) {
    leadPayload.fields.PHONE = [{ VALUE: payload.phone, VALUE_TYPE: 'WORK' }];
  }

  if (payload.company) {
    leadPayload.fields.COMPANY_TITLE = payload.company;
  }

  if (payload.message) {
    leadPayload.fields.COMMENTS = payload.message;
  }

  if (payload.serviceInterest) {
    leadPayload.fields.UF_CRM_SERVICE_INTEREST = payload.serviceInterest;
  }

  // Add assignment if configured
  if (config.assignedById) {
    leadPayload.fields.ASSIGNED_BY_ID = config.assignedById;
  }

  // Add category if configured
  if (config.categoryId) {
    leadPayload.fields.CATEGORY_ID = config.categoryId;
  }

  // Add status if configured
  if (config.statusId) {
    leadPayload.fields.STATUS_ID = config.statusId;
  }

  // Add custom fields
  Object.entries(config.customFields).forEach(([fieldKey, fieldValue]) => {
    leadPayload.fields[fieldKey] = payload.customFields?.[fieldKey] || fieldValue;
  });

  return leadPayload;
};

// Legacy type for backward compatibility
export type LeadPayload = Bitrix24FieldMapping;

export const sendLeadToBitrix = async (
  contactRequestId: string, 
  payload: Bitrix24FieldMapping
): Promise<{ leadId?: string | number; success: boolean; error?: string }> => {
  const config = getBitrix24Config();
  const log = await prisma.leadLog.create({
    data: {
      contactRequestId,
      payload: {
        ...payload,
        config: {
          assignedById: config.assignedById,
          categoryId: config.categoryId,
          statusId: config.statusId,
          sourceId: config.sourceId,
        },
      },
    },
  });

  if (!BITRIX_ENABLED) {
    if (config.enableLogging) {
      logger.info({ payload, logId: log.id }, 'Bitrix24 stub enabled; lead not sent');
    }
    await prisma.leadLog.update({
      where: { id: log.id },
      data: { 
        status: 'SENT', 
        response: { 
          stub: true,
          message: 'Bitrix24 integration is in stub mode'
        } 
      },
    });
    return { leadId: `stub-${log.id}`, success: true };
  }

  const leadPayload = prepareLeadPayload(payload, config);

  try {
    const response = await pRetry(
      async () => {
        const webhookUrl = `${config.webhookUrl}crm.lead.add.json`;
        
        if (config.enableLogging) {
          logger.debug({ 
            webhookUrl, 
            payload: leadPayload, 
            logId: log.id 
          }, 'Sending lead to Bitrix24');
        }

        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'TB-Group-Website/1.0',
          },
          body: JSON.stringify(leadPayload),
        });

        const responseText = await res.text();
        
        if (!res.ok) {
          throw new Error(`Bitrix24 HTTP error: ${res.status} ${res.statusText} - ${responseText}`);
        }

        let response: Bitrix24Response;
        try {
          response = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error(`Invalid JSON response from Bitrix24: ${responseText}`);
        }

        if (response.error || response.error_description) {
          throw new Error(`Bitrix24 API error: ${response.error || response.error_description}`);
        }

        return response;
      },
      { 
        retries: config.retryAttempts,
        onFailedAttempt: async (error) => {
          logger.warn({ 
            error: error.message,
            attemptNumber: error.attemptNumber,
            retriesLeft: error.retriesLeft,
            logId: log.id
          }, 'Bitrix24 API attempt failed');
        }
      },
    );

    const leadId = response.result?.ID;
    const responseData = {
      ...response,
      payload: leadPayload,
      timestamp: new Date().toISOString(),
    };

    await prisma.leadLog.update({
      where: { id: log.id },
      data: {
        status: 'SENT',
        response: responseData,
        externalId: leadId ? String(leadId) : undefined,
      },
    });

    if (config.enableLogging) {
      logger.info({ 
        leadId, 
        responseTime: response.time?.duration,
        logId: log.id 
      }, 'Successfully sent lead to Bitrix24');
    }

    return { leadId, success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error({ 
      error: errorMessage, 
      payload: leadPayload,
      logId: log.id 
    }, 'Failed to send lead to Bitrix24');
    
    await prisma.leadLog.update({
      where: { id: log.id },
      data: {
        status: 'FAILED',
        error: errorMessage,
        response: {
          error: errorMessage,
          timestamp: new Date().toISOString(),
          payload: leadPayload,
        },
      },
    });

    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

// Additional functions for enhanced Bitrix24 integration

export const getBitrix24Lead = async (leadId: string): Promise<any> => {
  const config = getBitrix24Config();
  
  if (!BITRIX_ENABLED) {
    throw new Error('Bitrix24 integration is disabled');
  }

  try {
    const webhookUrl = `${config.webhookUrl}crm.lead.get.json`;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: leadId,
        select: ['*', 'UF_*'],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch lead: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    logger.error({ error, leadId }, 'Failed to get Bitrix24 lead');
    throw error;
  }
};

export const updateBitrix24Lead = async (
  leadId: string, 
  fields: Record<string, any>
): Promise<boolean> => {
  const config = getBitrix24Config();
  
  if (!BITRIX_ENABLED) {
    throw new Error('Bitrix24 integration is disabled');
  }

  try {
    const webhookUrl = `${config.webhookUrl}crm.lead.update.json`;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: leadId,
        fields,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update lead: ${response.statusText}`);
    }

    const result = await response.json();
    return result.result === true;
  } catch (error) {
    logger.error({ error, leadId, fields }, 'Failed to update Bitrix24 lead');
    throw error;
  }
};

export const testBitrix24Connection = async (): Promise<{
  success: boolean;
  domain?: string;
  error?: string;
}> => {
  const config = getBitrix24Config();
  
  if (!BITRIX_ENABLED) {
    return { success: false, error: 'Bitrix24 integration is disabled' };
  }

  try {
    const webhookUrl = `${config.webhookUrl}crm.lead.fields.json`;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Connection test failed: ${response.statusText}`);
    }

    const result = await response.json();
    return { 
      success: true, 
      domain: config.domain || 'Unknown',
      fields: result.result
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export default sendLeadToBitrix;
