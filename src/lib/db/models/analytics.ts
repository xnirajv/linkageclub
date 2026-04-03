import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnalytics extends Document {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  date: Date;
  
  // User metrics
  users: {
    total: number;
    new: number;
    active: number;
    byRole: {
      student: number;
      company: number;
      mentor: number;
      founder: number;
    };
    byLocation: Map<string, number>;
    retentionRate: number;
    churnRate: number;
  };
  
  // Project metrics
  projects: {
    total: number;
    new: number;
    active: number;
    completed: number;
    byCategory: Map<string, number>;
    byStatus: {
      open: number;
      inProgress: number;
      completed: number;
      cancelled: number;
    };
    averageBudget: number;
    averageDuration: number;
    totalSpent: number;
  };
  
  // Job metrics
  jobs: {
    total: number;
    new: number;
    active: number;
    filled: number;
    byType: Map<string, number>;
    byLocation: Map<string, number>;
    averageSalary: number;
    totalHires: number;
  };
  
  // Assessment metrics
  assessments: {
    total: number;
    taken: number;
    passed: number;
    failed: number;
    revenue: number;
    popularSkills: Map<string, number>;
    averageScore: number;
    passRate: number;
  };
  
  // Mentor metrics
  mentors: {
    total: number;
    active: number;
    new: number;
    sessions: number;
    revenue: number;
    averageRating: number;
    popularTopics: Map<string, number>;
  };
  
  // Payment metrics
  payments: {
    total: number;
    successful: number;
    failed: number;
    refunded: number;
    revenue: number;
    platformFees: number;
    averageTransaction: number;
    byMethod: Map<string, number>;
  };
  
  // Engagement metrics
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    pageViews: number;
    bounceRate: number;
  };
  
  // Community metrics
  community: {
    posts: number;
    comments: number;
    likes: number;
    shares: number;
    activeUsers: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>(
  {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    
    // User metrics
    users: {
      total: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      byRole: {
        student: { type: Number, default: 0 },
        company: { type: Number, default: 0 },
        mentor: { type: Number, default: 0 },
        founder: { type: Number, default: 0 },
      },
      byLocation: { type: Map, of: Number, default: {} },
      retentionRate: { type: Number, default: 0 },
      churnRate: { type: Number, default: 0 },
    },
    
    // Project metrics
    projects: {
      total: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      byCategory: { type: Map, of: Number, default: {} },
      byStatus: {
        open: { type: Number, default: 0 },
        inProgress: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        cancelled: { type: Number, default: 0 },
      },
      averageBudget: { type: Number, default: 0 },
      averageDuration: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
    },
    
    // Job metrics
    jobs: {
      total: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      filled: { type: Number, default: 0 },
      byType: { type: Map, of: Number, default: {} },
      byLocation: { type: Map, of: Number, default: {} },
      averageSalary: { type: Number, default: 0 },
      totalHires: { type: Number, default: 0 },
    },
    
    // Assessment metrics
    assessments: {
      total: { type: Number, default: 0 },
      taken: { type: Number, default: 0 },
      passed: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      popularSkills: { type: Map, of: Number, default: {} },
      averageScore: { type: Number, default: 0 },
      passRate: { type: Number, default: 0 },
    },
    
    // Mentor metrics
    mentors: {
      total: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      sessions: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      popularTopics: { type: Map, of: Number, default: {} },
    },
    
    // Payment metrics
    payments: {
      total: { type: Number, default: 0 },
      successful: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      refunded: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      platformFees: { type: Number, default: 0 },
      averageTransaction: { type: Number, default: 0 },
      byMethod: { type: Map, of: Number, default: {} },
    },
    
    // Engagement metrics
    engagement: {
      dailyActiveUsers: { type: Number, default: 0 },
      weeklyActiveUsers: { type: Number, default: 0 },
      monthlyActiveUsers: { type: Number, default: 0 },
      averageSessionDuration: { type: Number, default: 0 },
      pageViews: { type: Number, default: 0 },
      bounceRate: { type: Number, default: 0 },
    },
    
    // Community metrics
    community: {
      posts: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      activeUsers: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
analyticsSchema.index({ type: 1, date: 1 }, { unique: true });
analyticsSchema.index({ date: -1 });

const Analytics: Model<IAnalytics> = mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', analyticsSchema);

export default Analytics;