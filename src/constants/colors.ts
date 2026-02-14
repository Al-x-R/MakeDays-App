// src/constants/colors.ts

const colors = {
  background: '#050508',

  gradients: {
    past: ['#2A4557', '#1B2E3C'] as const,

    today: ['#91f1fb', '#52d4e3'] as const,

    future: ['#33B5E5', '#0097A7'] as const,


    // "To-do" / "Design Review"
    purple: ['#C084FC', '#7E22CE'] as const,
    indigo: ['#818CF8', '#3730A3'] as const,

    // "In Review" / "Warning"
    yellow: ['#FDE047', '#CA8A04'] as const,

    // "Done" / "Success"
    green: ['#4ADE80', '#166534'] as const,

    // "Rework" / "Blocked" / "Error"
    orange: ['#FB923C', '#C2410C'] as const,
    red:    ['#F87171', '#991B1B'] as const,

    // "Not Started"
    pink:   ['#F472B6', '#BE185D'] as const,

    // "On Hold"
    blue:   ['#60A5FA', '#1D4ED8'] as const,
  },

  borders: {
    past: '#375163',
    future: '#00BCD4',
    subtle: '#1E293B',
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#94A3B8',
    dim: '#A0B0C0',
    inverse: '#001F29',
    futureText: '#E0F7FA',
    onGradient: '#FFFFFF',
  },
} as const;

export default colors;
