import { colors } from '@/styles/theme';

export const useTheme = () => {
  const theme = {
    card: {
      base: 'bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200',
      header: 'p-6 border-b border-gray-100',
      content: 'p-6',
    },
    badge: {
      critical: `bg-error-50 text-error-700 ring-1 ring-error-200`,
      high: `bg-warning-50 text-warning-700 ring-1 ring-warning-200`,
      medium: `bg-primary-50 text-primary-700 ring-1 ring-primary-200`,
      low: `bg-success-50 text-success-700 ring-1 ring-success-200`,
    },
    chart: {
      gradients: {
        primary: {
          start: colors.primary[400],
          end: colors.primary[50],
        },
        success: {
          start: colors.success[400],
          end: colors.success[50],
        },
        warning: {
          start: colors.warning[400],
          end: colors.warning[50],
        },
      },
      tooltip: 'bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl text-sm',
    },
    button: {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow',
      secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm hover:shadow',
      danger: 'bg-error-600 hover:bg-error-700 text-white shadow-sm hover:shadow',
    },
    input: {
      base: 'rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
      checkbox: 'rounded text-primary-600 focus:ring-primary-500 border-gray-300',
    },
    animation: {
      hover: 'transition-all duration-200 ease-in-out',
      fade: 'transition-opacity duration-200 ease-in-out',
      scale: 'transition-transform duration-200 ease-in-out',
    },
  };

  return theme;
}; 