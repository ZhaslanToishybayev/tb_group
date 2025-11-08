'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  Input,
  Modal,
  Tooltip,
  Toast,
  Spinner,
  Progress,
  useModal,
  useToast,
  toastVariants,
} from './ui';
import { fadeInUp, staggerContainer } from './animations/variants';
import { textGradients, componentStyles } from '../lib/design/utils';

// Icons (simple SVG for demo)
const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);

export default function ComponentsDemo() {
  const { open: confirmModalOpen, openModal: openConfirmModal, closeModal: closeConfirmModal } = useModal(false);
  const { open: customModalOpen, openModal: openCustomModal, closeModal: closeCustomModal } = useModal(false);
  const { showToast } = useToast();

  const [progress, setProgress] = React.useState(65);

  const handleConfirmAction = () => {
    showToast({
      title: 'Confirmed!',
      description: 'Your action has been confirmed.',
      variant: 'success',
    });
    closeConfirmModal();
  };

  const handleCustomToast = (variant: any) => {
    showToast({
      title: `${variant.charAt(0).toUpperCase() + variant.slice(1)} Toast`,
      description: `This is a ${variant} notification example.`,
      variant,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <motion.div
        className="text-center mb-16"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.h1
          className="text-6xl font-bold mb-4"
          variants={fadeInUp}
        >
          <span className={textGradients.neon}>Core UI Components</span>
        </motion.h1>
        <motion.p
          className="text-xl text-slate-300"
          variants={fadeInUp}
        >
          Modern, Animated, and Accessible UI Components for TB Group
        </motion.p>
      </motion.div>

      <div className="max-w-7xl mx-auto space-y-16">
        {/* Button Variants */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl font-bold mb-8 text-center"
            variants={fadeInUp}
          >
            <span className={textGradients.primary}>Button Components</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Primary Buttons</CardTitle>
                <CardDescription>Main action buttons with different variants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" size="sm">Primary</Button>
                    <Button variant="primary" size="md">Primary</Button>
                    <Button variant="primary" size="lg">Primary</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" leftIcon={<StarIcon className="w-4 h-4" />} />
                    <Button variant="primary" rightIcon={<HeartIcon className="w-4 h-4" />} />
                    <Button variant="primary" loading>Loading</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variant Showcase */}
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>Different visual styles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" size="sm">Secondary</Button>
                  <Button variant="ghost" size="sm">Ghost</Button>
                  <Button variant="neon" size="sm">Neon</Button>
                  <Button variant="gradient" size="sm">Gradient</Button>
                  <Button variant="success" size="sm">Success</Button>
                  <Button variant="warning" size="sm">Warning</Button>
                  <Button variant="error" size="sm">Error</Button>
                  <Button variant="outline" size="sm">Outline</Button>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Interactive Buttons</CardTitle>
                <CardDescription>With hover effects and animations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    glow="large"
                    onClick={() => handleCustomToast('primary')}
                  >
                    Glow Effect
                  </Button>
                  <Button
                    variant="neon"
                    className="w-full"
                    onClick={() => handleCustomToast('info')}
                  >
                    Show Neon Toast
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Card Components */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl font-bold mb-8 text-center"
            variants={fadeInUp}
          >
            <span className={textGradients.secondary}>Card Components</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="default" hover="lift">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Standard card with lift hover effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">This card lifts on hover with enhanced shadow.</p>
              </CardContent>
            </Card>

            <Card variant="glass" hover="glow">
              <CardHeader>
                <CardTitle>Glass Card</CardTitle>
                <CardDescription>Glassmorphism effect with glow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Beautiful glass effect with backdrop blur.</p>
              </CardContent>
            </Card>

            <Card variant="gradient" hover="scale">
              <CardHeader>
                <CardTitle>Gradient Card</CardTitle>
                <CardDescription>Gradient background with scale hover</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Gradient card that scales on hover.</p>
              </CardContent>
            </Card>

            <InteractiveCard hover="tilt" onClick={() => showToast({ title: 'Interactive!', description: 'Card clicked!', variant: 'success' })}>
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
                <CardDescription>3D tilt effect on hover</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Move your mouse over this card to see the 3D effect!</p>
              </CardContent>
            </InteractiveCard>
          </div>
        </motion.section>

        {/* Input Components */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl font-bold mb-8 text-center"
            variants={fadeInUp}
          >
            <span className={textGradients.glass}>Input Components</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Text Inputs</CardTitle>
                <CardDescription>Floating labels and focus animations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input label="Email Address" placeholder="Enter your email" type="email" />
                  <Input label="Password" placeholder="Enter password" type="password" />
                  <Input label="Full Name" placeholder="Enter your name" variant="glass" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Input Variants</CardTitle>
                <CardDescription>Different visual styles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input label="Primary Input" variant="default" />
                  <Input label="Gradient Input" variant="gradient" />
                  <Input label="Neon Input" variant="neon" />
                  <Input label="Success Input" success="Looks good!" />
                  <Input label="Error Input" error="This field has an error" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Modal Components */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl font-bold mb-8 text-center"
            variants={fadeInUp}
          >
            <span className={textGradients.neon}>Modal Components</span>
          </motion.h2>

          <Card>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="primary" onClick={openConfirmModal}>
                  Confirm Modal
                </Button>
                <Button variant="secondary" onClick={openCustomModal}>
                  Custom Modal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Confirm Modal */}
          <Modal
            open={confirmModalOpen}
            onOpenChange={closeConfirmModal}
            title="Confirm Action"
            description="Are you sure you want to perform this action?"
            variant="glass"
            size="md"
          >
            <div className="space-y-4">
              <p className="text-slate-300">
                This action cannot be undone. Please confirm that you want to proceed.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={closeConfirmModal} className="flex-1">
                  Cancel
                </Button>
                <Button variant="error" onClick={handleConfirmAction} className="flex-1">
                  Confirm
                </Button>
              </div>
            </div>
          </Modal>

          {/* Custom Modal */}
          <Modal
            open={customModalOpen}
            onOpenChange={closeCustomModal}
            title="Custom Modal"
            variant="gradient"
            size="lg"
          >
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <StarIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Beautiful Modal</h3>
                <p className="text-slate-300">
                  This is a custom modal with gradient background and beautiful animations.
                </p>
              </div>
              <Progress value={progress} variant="primary" animated="glow" className="my-4" />
              <div className="flex gap-3">
                <Button variant="ghost" onClick={closeCustomModal} className="flex-1">
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setProgress(Math.min(100, progress + 10))}
                  className="flex-1"
                >
                  Progress +10%
                </Button>
              </div>
            </div>
          </Modal>
        </motion.section>

        {/* Tooltip, Spinner, Progress */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl font-bold mb-8 text-center"
            variants={fadeInUp}
          >
            <span className={textGradients.rainbow}>Additional Components</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tooltips */}
            <Card>
              <CardHeader>
                <CardTitle>Tooltips</CardTitle>
                <CardDescription>Hover for more information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Tooltip content="This is a primary tooltip" variant="primary" placement="top">
                    <Button variant="primary" size="sm">Primary</Button>
                  </Tooltip>
                  <Tooltip content="This is a neon tooltip" variant="neon" placement="top">
                    <Button variant="neon" size="sm">Neon</Button>
                  </Tooltip>
                  <Tooltip content="This is a glass tooltip" variant="glass" placement="top">
                    <Button variant="ghost" size="sm">Glass</Button>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>

            {/* Spinners */}
            <Card>
              <CardHeader>
                <CardTitle>Loading Spinners</CardTitle>
                <CardDescription>Various loading indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Spinner size="sm" variant="primary" />
                    <Spinner size="md" variant="neon" />
                    <Spinner size="lg" variant="gradient" />
                  </div>
                  <div className="flex items-center gap-4">
                    <DotsSpinner size="sm" />
                    <PulseSpinner size="md" />
                    <BounceSpinner size="sm" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Bars */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Bars</CardTitle>
                <CardDescription>Visual progress indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={75} variant="primary" showValue />
                  <Progress value={50} variant="success" animated="pulse" />
                  <Progress value={85} variant="neon" striped animated="glow" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Toast Notifications */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl font-bold mb-8 text-center"
            variants={fadeInUp}
          >
            <span className={textGradients.primary}>Toast Notifications</span>
          </motion.h2>

          <Card>
            <CardHeader>
              <CardTitle>Toast Variants</CardTitle>
              <CardDescription>Click to see different toast notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button variant="primary" onClick={() => handleCustomToast('default')}>
                  Default Toast
                </Button>
                <Button variant="success" onClick={() => handleCustomToast('success')}>
                  Success Toast
                </Button>
                <Button variant="error" onClick={() => handleCustomToast('error')}>
                  Error Toast
                </Button>
                <Button variant="warning" onClick={() => handleCustomToast('warning')}>
                  Warning Toast
                </Button>
                <Button variant="neon" onClick={() => handleCustomToast('info')}>
                  Info Toast
                </Button>
                <Button variant="gradient" onClick={() => handleCustomToast('glass')}>
                  Glass Toast
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Circular Progress */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl font-bold mb-8 text-center"
            variants={fadeInUp}
          >
            <span className={textGradients.secondary}>Circular Progress</span>
          </motion.h2>

          <Card>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-center">
                <div className="text-center">
                  <CircularProgress value={85} size={120} variant="primary" animated="glow" showValue label="Complete" />
                </div>
                <div className="text-center">
                  <CircularProgress value={65} size={120} variant="success" animated="pulse" showValue label="Progress" />
                </div>
                <div className="text-center">
                  <CircularProgress value={45} size={120} variant="neon" animated="pulse" showValue label="Loading" />
                </div>
                <div className="text-center">
                  <CircularProgress value={25} size={120} variant="gradient" animated="pulse" showValue label="Starting" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Summary */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl">✨ Core UI Components Complete!</CardTitle>
              <CardDescription>
                All components are built with modern design patterns, animations, and accessibility in mind.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-slate-300">
                  Components include:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-slate-400">
                  <div>• 8 Button variants</div>
                  <div>• 6 Card types</div>
                  <div>• 5 Input styles</div>
                  <div>• 3 Modal types</div>
                  <div>• 3 Tooltip variants</div>
                  <div>• 6 Toast types</div>
                  <div>• 5 Spinner styles</div>
                  <div>• 3 Progress types</div>
                </div>
                <div className="pt-6">
                  <Button
                    variant="gradient"
                    size="lg"
                    onClick={() => showToast({
                      title: 'Task 2 Complete!',
                      description: 'Core UI Component Library is ready for use.',
                      variant: 'success'
                    })}
                  >
                    Mark Task Complete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
