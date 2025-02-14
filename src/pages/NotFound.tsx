import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotFound() {
  const theme = useTheme();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8 text-9xl font-bold text-gray-200"
        >
          404
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4 text-4xl font-bold text-gray-900"
        >
          Page Not Found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 text-lg text-gray-600"
        >
          Oops! The page you're looking for doesn't exist.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-4 sm:flex-row sm:gap-6"
        >
          <Button
            asChild
            size="lg"
            className={cn(
              'flex items-center gap-2',
              theme.button.primary
            )}
          >
            <Link to="/">
              <Home className="h-5 w-5" />
              Return to Home
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className={cn(
              'flex items-center gap-2',
              theme.button.secondary
            )}
          >
            <Link to="#" onClick={() => window.history.back()}>
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-sm text-gray-500"
        >
          <p>
            If you believe this is a mistake, please{' '}
            <Link
              to="/contact"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              contact support
            </Link>
            .
          </p>
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="absolute -top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 transform rounded-full bg-gradient-to-br from-primary-100 to-primary-50 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-gradient-to-tr from-warning-100 to-warning-50 blur-2xl"
        />
      </div>
    </div>
  );
}
