export const features = {
  auth: {
    socialLogin: true,
    emailVerification: true,
    twoFactorAuth: false,
  },
  payment: {
    enabled: true,
    provider: 'razorpay',
    escrow: true,
    instantPayouts: true,
  },
  ai: {
    matching: true,
    recommendations: true,
    fraudDetection: true,
    resumeParsing: true,
  },
  community: {
    posts: true,
    comments: true,
    likes: true,
    sharing: true,
    moderation: true,
  },
  mentorship: {
    enabled: true,
    videoCall: true,
    resourceSharing: true,
    sessionRecording: false,
  },
  assessments: {
    enabled: true,
    badges: true,
    skillVerification: true,
    practiceMode: true,
  },
  notifications: {
    email: true,
    push: true,
    sms: false,
    inApp: true,
  },
  analytics: {
    userBehavior: true,
    conversion: true,
    revenue: true,
  },
  search: {
    elasticsearch: false,
    fullText: true,
    filters: true,
    autocomplete: true,
  },
};