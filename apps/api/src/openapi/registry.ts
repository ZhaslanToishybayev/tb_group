import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

import { serviceEntitySchema, serviceCreateSchema, serviceUpdateSchema } from '../modules/services/services.schemas';
import { caseEntitySchema, caseCreateSchema, caseUpdateSchema } from '../modules/cases/cases.schemas';
import { reviewEntitySchema, reviewCreateSchema, reviewUpdateSchema } from '../modules/reviews/reviews.schemas';
import { bannerEntitySchema, bannerCreateSchema, bannerUpdateSchema } from '../modules/banners/banners.schemas';
import { settingEntitySchema, settingUpsertSchema } from '../modules/settings/settings.schemas';
import { mediaEntitySchema, mediaCreateSchema, mediaUpdateSchema } from '../modules/media/media.schemas';
import { loginSchema, refreshSchema, logoutSchema } from '../modules/auth/auth.validators';
import { contactCreateSchema, contactResponseSchema } from '../modules/contact/contact.schemas';

const registry = new OpenAPIRegistry();

const envelope = <T extends z.ZodTypeAny>(schema: T) => z.object({ data: schema });

const listEnvelope = <T extends z.ZodTypeAny>(schema: T) => z.object({ data: z.array(schema) });

const registerSchemas = () => {
  registry.register('Service', serviceEntitySchema);
  registry.register('ServiceCreate', serviceCreateSchema);
  registry.register('ServiceUpdate', serviceUpdateSchema);

  registry.register('Case', caseEntitySchema);
  registry.register('CaseCreate', caseCreateSchema);
  registry.register('CaseUpdate', caseUpdateSchema);

  registry.register('Review', reviewEntitySchema);
  registry.register('ReviewCreate', reviewCreateSchema);
  registry.register('ReviewUpdate', reviewUpdateSchema);

  registry.register('Banner', bannerEntitySchema);
  registry.register('BannerCreate', bannerCreateSchema);
  registry.register('BannerUpdate', bannerUpdateSchema);

  registry.register('Setting', settingEntitySchema);
  registry.register('SettingUpsert', settingUpsertSchema);

  registry.register('Media', mediaEntitySchema);
  registry.register('MediaCreate', mediaCreateSchema);
  registry.register('MediaUpdate', mediaUpdateSchema);

  registry.register('AuthLogin', loginSchema);
  registry.register('AuthRefresh', refreshSchema);
  registry.register('AuthLogout', logoutSchema);
  registry.register('ContactCreate', contactCreateSchema);
  registry.register('ContactResponse', contactResponseSchema);
};

registerSchemas();

// Auth
registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  summary: 'Admin login',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Tokens issued',
    },
    401: {
      description: 'Invalid credentials',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/refresh',
  summary: 'Refresh tokens',
  request: {
    body: {
      content: {
        'application/json': {
          schema: refreshSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Tokens rotated',
    },
    401: { description: 'Invalid refresh token' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/logout',
  summary: 'Revoke refresh token',
  request: {
    body: {
      content: {
        'application/json': {
          schema: logoutSchema,
        },
      },
    },
  },
  responses: {
    204: { description: 'Token revoked' },
  },
  security: [{ bearerAuth: [] }],
});

const registerCrud = () => {
  registry.registerPath({
    method: 'get',
    path: '/api/services',
    summary: 'List services',
    responses: {
      200: {
        description: 'List of services',
        content: {
          'application/json': {
            schema: listEnvelope(serviceEntitySchema),
          },
        },
      },
    },
  });
  registry.registerPath({
    method: 'post',
    path: '/api/services',
    summary: 'Create service',
    request: {
      body: {
        content: {
          'application/json': {
            schema: serviceCreateSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Service created',
        content: {
          'application/json': {
            schema: envelope(serviceEntitySchema),
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  });
  registry.registerPath({
    method: 'get',
    path: '/api/services/{idOrSlug}',
    summary: 'Get service',
    responses: {
      200: {
        description: 'Service',
        content: {
          'application/json': {
            schema: envelope(serviceEntitySchema),
          },
        },
      },
      404: { description: 'Not found' },
    },
  });
  registry.registerPath({
    method: 'put',
    path: '/api/services/{idOrSlug}',
    summary: 'Update service',
    request: {
      body: {
        content: {
          'application/json': { schema: serviceUpdateSchema },
        },
      },
    },
    responses: {
      200: {
        description: 'Service updated',
        content: {
          'application/json': {
            schema: envelope(serviceEntitySchema),
          },
        },
      },
      404: { description: 'Not found' },
    },
    security: [{ bearerAuth: [] }],
  });
  registry.registerPath({
    method: 'delete',
    path: '/api/services/{idOrSlug}',
    summary: 'Delete service',
    responses: {
      204: { description: 'Deleted' },
      404: { description: 'Not found' },
    },
    security: [{ bearerAuth: [] }],
  });

  const registerListCrud = (
    path: string,
    entity: z.ZodTypeAny,
    create: z.ZodTypeAny,
  ) => {
    registry.registerPath({
      method: 'get',
      path,
      summary: `List ${path}`,
      responses: {
        200: {
          description: 'List',
          content: {
            'application/json': {
              schema: listEnvelope(entity),
            },
          },
        },
      },
    });
    registry.registerPath({
      method: 'post',
      path,
      summary: `Create ${path}`,
      request: {
        body: {
          content: {
            'application/json': { schema: create },
          },
        },
      },
      responses: {
        201: {
          description: 'Created',
          content: {
            'application/json': {
              schema: envelope(entity),
            },
          },
        },
      },
      security: [{ bearerAuth: [] }],
    });
  };

  registerListCrud('/api/cases', caseEntitySchema, caseCreateSchema);
  registerListCrud('/api/reviews', reviewEntitySchema, reviewCreateSchema);
  registerListCrud('/api/banners', bannerEntitySchema, bannerCreateSchema);
  registerListCrud('/api/media', mediaEntitySchema, mediaCreateSchema);

  const registerSingle = (path: string, entity: z.ZodTypeAny, update: z.ZodTypeAny) => {
    registry.registerPath({
      method: 'get',
      path,
      summary: `Get ${path}`,
      responses: {
        200: {
          description: 'Record',
          content: {
            'application/json': {
              schema: envelope(entity),
            },
          },
        },
        404: { description: 'Not found' },
      },
    });
    registry.registerPath({
      method: 'put',
      path,
      summary: `Update ${path}`,
      request: {
        body: {
          content: {
            'application/json': { schema: update },
          },
        },
      },
      responses: {
        200: {
          description: 'Updated',
          content: {
            'application/json': {
              schema: envelope(entity),
            },
          },
        },
        404: { description: 'Not found' },
      },
      security: [{ bearerAuth: [] }],
    });
    registry.registerPath({
      method: 'delete',
      path,
      summary: `Delete ${path}`,
      responses: {
        204: { description: 'Deleted' },
        404: { description: 'Not found' },
      },
      security: [{ bearerAuth: [] }],
    });
  };

  registerSingle('/api/cases/{idOrSlug}', caseEntitySchema, caseUpdateSchema);
  registerSingle('/api/reviews/{id}', reviewEntitySchema, reviewUpdateSchema);
  registerSingle('/api/banners/{id}', bannerEntitySchema, bannerUpdateSchema);
  registerSingle('/api/media/{id}', mediaEntitySchema, mediaUpdateSchema);

  registry.registerPath({
    method: 'get',
    path: '/api/settings',
    summary: 'List settings',
    responses: {
      200: {
        description: 'Settings',
        content: {
          'application/json': {
            schema: listEnvelope(settingEntitySchema),
          },
        },
      },
    },
  });
  registry.registerPath({
    method: 'get',
    path: '/api/settings/{key}',
    summary: 'Get setting',
    responses: {
      200: {
        description: 'Setting',
        content: {
          'application/json': {
            schema: envelope(settingEntitySchema),
          },
        },
      },
      404: { description: 'Not found' },
    },
  });
  registry.registerPath({
    method: 'put',
    path: '/api/settings/{key}',
    summary: 'Upsert setting',
    request: {
      body: {
        content: {
          'application/json': { schema: settingUpsertSchema },
        },
      },
    },
    responses: {
      200: {
        description: 'Setting updated',
        content: {
          'application/json': {
            schema: envelope(settingEntitySchema),
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  });
  registry.registerPath({
    method: 'delete',
    path: '/api/settings/{key}',
    summary: 'Delete setting',
    responses: {
      204: { description: 'Deleted' },
    },
    security: [{ bearerAuth: [] }],
  });
};

registerCrud();

registry.registerPath({
  method: 'post',
  path: '/api/contact',
  summary: 'Submit contact request',
  request: {
    body: {
      content: {
        'application/json': { schema: contactCreateSchema },
      },
    },
  },
  responses: {
    202: {
      description: 'Contact request queued',
      content: {
        'application/json': {
          schema: envelope(contactResponseSchema),
        },
      },
    },
    422: { description: 'Validation failed' },
  },
});

export { registry };
