import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Printer,
  Clock,
  User,
  Calendar,
  Tag,
  HelpCircle,
  Mail,
  MessageCircle,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HelpArticlePageProps {
  params: {
    article: string;
  };
}

// Mock data - replace with CMS or database
const articles = {
  'how-to-create-account': {
    id: 'how-to-create-account',
    title: 'How to Create an Account',
    content: `
      <h2>Getting Started with InternHub</h2>
      <p>Creating an account on InternHub is quick and easy. Follow these steps to join our community:</p>
      
      <h3>Step 1: Visit the Sign Up Page</h3>
      <p>Click the "Sign Up" button in the top right corner of the homepage. You'll be presented with different account types based on your role.</p>
      
      <h3>Step 2: Choose Your Role</h3>
      <p>Select the appropriate role for your needs:</p>
      <ul>
        <li><strong>Student</strong> - For learners looking to gain skills, get verified, and find opportunities</li>
        <li><strong>Company</strong> - For businesses seeking to hire talent or post projects</li>
        <li><strong>Mentor</strong> - For industry experts wanting to guide and earn</li>
        <li><strong>Founder</strong> - For startup founders building their team</li>
      </ul>
      
      <h3>Step 3: Fill in Your Details</h3>
      <p>Complete the registration form with your information. Make sure to use a valid email address as you'll need to verify it later.</p>
      
      <h3>Step 4: Verify Your Email</h3>
      <p>Check your inbox for a verification email from us. Click the verification link to activate your account.</p>
      
      <h3>Step 5: Complete Your Profile</h3>
      <p>Once verified, log in and complete your profile. Add your skills, experience, and other relevant information to get the most out of InternHub.</p>
      
      <div class="bg-blue-50 p-4 rounded-lg mt-4">
        <p class="text-blue-800 font-medium">💡 Pro Tip:</p>
        <p class="text-blue-700">Adding a complete profile with verified skills increases your Trust Score and makes you more visible to potential employers or collaborators.</p>
      </div>
    `,
    category: 'Getting Started',
    author: 'InternHub Team',
    authorRole: 'Support',
    publishedAt: '2024-01-15',
    updatedAt: '2024-02-01',
    readTime: 5,
    views: 1234,
    helpful: 89,
    notHelpful: 11,
    tags: ['account', 'signup', 'registration', 'basics'],
    relatedArticles: [
      { slug: 'trust-score-explained', title: 'Understanding Trust Score' },
      { slug: 'how-to-apply-projects', title: 'How to Apply for Projects' },
      { slug: 'payment-methods', title: 'Payment Methods Accepted' },
    ],
  },
  'trust-score-explained': {
    id: 'trust-score-explained',
    title: 'Understanding Trust Score',
    content: `
      <h2>What is Trust Score?</h2>
      <p>Trust Score is a 0-100 rating that represents how reliable and skilled a user is on InternHub. It's like a credit score for your professional profile.</p>
      
      <h3>How Trust Score is Calculated</h3>
      <p>Your Trust Score is based on multiple factors:</p>
      
      <h4>1. Skill Verification (35%)</h4>
      <ul>
        <li>Each verified skill adds points to your score</li>
        <li>Advanced level certifications contribute more</li>
        <li>Skill tests passed increase your verification score</li>
      </ul>
      
      <h4>2. Project Completion (30%)</h4>
      <ul>
        <li>Successfully completed projects boost your score</li>
        <li>Positive reviews from clients add significant points</li>
        <li>On-time delivery record matters</li>
      </ul>
      
      <h4>3. Platform Activity (20%)</h4>
      <ul>
        <li>Regular login and engagement</li>
        <li>Profile completeness</li>
        <li>Community participation</li>
        <li>Quick response times</li>
      </ul>
      
      <h4>4. Verification (15%)</h4>
      <ul>
        <li>Email verification</li>
        <li>Phone verification</li>
        <li>ID verification</li>
        <li>LinkedIn/GitHub connection</li>
      </ul>
      
      <h3>Why Trust Score Matters</h3>
      <p>A higher Trust Score gives you:</p>
      <ul>
        <li>Better visibility in searches</li>
        <li>Priority in project applications</li>
        <li>Higher chance of getting hired</li>
        <li>Access to premium opportunities</li>
        <li>Increased credibility with employers</li>
      </ul>
      
      <h3>How to Improve Your Trust Score</h3>
      <ol>
        <li>Complete skill assessments to get verified</li>
        <li>Successfully complete projects and get good reviews</li>
        <li>Stay active on the platform</li>
        <li>Verify your contact information and social profiles</li>
        <li>Maintain a high response rate</li>
      </ol>
      
      <div class="bg-green-50 p-4 rounded-lg mt-4">
        <p class="text-green-800 font-medium">✅ Did you know?</p>
        <p class="text-green-700">Users with Trust Score above 80% get 3x more project invitations!</p>
      </div>
    `,
    category: 'Account & Profile',
    author: 'Rahul Sharma',
    authorRole: 'Product Manager',
    publishedAt: '2024-01-20',
    updatedAt: '2024-02-05',
    readTime: 8,
    views: 2341,
    helpful: 156,
    notHelpful: 12,
    tags: ['trust-score', 'profile', 'verification', 'credibility'],
    relatedArticles: [
      { slug: 'how-to-create-account', title: 'How to Create an Account' },
      { slug: 'skill-assessments', title: 'Taking Skill Assessments' },
      { slug: 'profile-setup', title: 'Setting Up Your Profile' },
    ],
  },
  'how-to-apply-projects': {
    id: 'how-to-apply-projects',
    title: 'How to Apply for Projects',
    content: `
      <h2>Finding and Applying to Projects</h2>
      <p>InternHub connects students with exciting project opportunities. Here's how to find and apply for projects that match your skills.</p>
      
      <h3>Step 1: Browse Available Projects</h3>
      <p>Navigate to the Projects section in your dashboard. You can filter projects by:</p>
      <ul>
        <li>Category (Web Dev, Mobile, AI/ML, etc.)</li>
        <li>Skills required</li>
        <li>Budget range</li>
        <li>Duration</li>
        <li>Experience level</li>
      </ul>
      
      <h3>Step 2: Review Project Details</h3>
      <p>Click on any project to see full details including:</p>
      <ul>
        <li>Project description and requirements</li>
        <li>Budget breakdown</li>
        <li>Milestones and timeline</li>
        <li>Company information</li>
        <li>Required skills and experience level</li>
      </ul>
      
      <h3>Step 3: Check Your Match Score</h3>
      <p>Our AI system calculates a match score based on your skills and profile. Higher match scores increase your chances of getting selected.</p>
      
      <h3>Step 4: Prepare Your Application</h3>
      <p>A strong application includes:</p>
      <ul>
        <li><strong>Proposed Amount:</strong> Suggest a fair price within the project budget</li>
        <li><strong>Timeline:</strong> Propose realistic delivery time</li>
        <li><strong>Cover Letter:</strong> Explain why you're the best fit</li>
        <li><strong>Portfolio/Resume:</strong> Showcase your relevant work</li>
      </ul>
      
      <h3>Step 5: Submit Your Application</h3>
      <p>Review your application, ensure all information is accurate, and submit. You'll receive a notification when the company reviews your application.</p>
      
      <div class="bg-yellow-50 p-4 rounded-lg mt-4">
        <p class="text-yellow-800 font-medium">⚠️ Important:</p>
        <p class="text-yellow-700">Make sure your profile is complete and your skills are verified before applying. This significantly improves your chances!</p>
      </div>
    `,
    category: 'Projects',
    author: 'Priya Patel',
    authorRole: 'Community Manager',
    publishedAt: '2024-01-18',
    updatedAt: '2024-02-03',
    readTime: 6,
    views: 1876,
    helpful: 134,
    notHelpful: 8,
    tags: ['projects', 'application', 'bidding', 'freelance'],
    relatedArticles: [
      { slug: 'trust-score-explained', title: 'Understanding Trust Score' },
      { slug: 'profile-setup', title: 'Setting Up Your Profile' },
      { slug: 'payment-methods', title: 'Payment Methods Accepted' },
    ],
  },
  'payment-methods': {
    id: 'payment-methods',
    title: 'Payment Methods Accepted',
    content: `
      <h2>Payment Options on InternHub</h2>
      <p>We offer multiple secure payment methods to ensure smooth transactions for all users.</p>
      
      <h3>For Students/Freelancers</h3>
      <p>You can receive payments through:</p>
      <ul>
        <li><strong>Bank Transfer:</strong> Direct to your Indian bank account</li>
        <li><strong>UPI:</strong> Instant payments to your UPI ID</li>
        <li><strong>Wallet:</strong> Add funds to your InternHub wallet</li>
      </ul>
      
      <h3>For Companies/Clients</h3>
      <p>You can make payments using:</p>
      <ul>
        <li><strong>Credit/Debit Cards:</strong> Visa, Mastercard, RuPay</li>
        <li><strong>UPI:</strong> Google Pay, PhonePe, Paytm, BHIM</li>
        <li><strong>Net Banking:</strong> All major Indian banks</li>
        <li><strong>Wallet:</strong> Use your InternHub wallet balance</li>
      </ul>
      
      <h3>Payment Processing</h3>
      <ul>
        <li>Payments are processed securely through Razorpay</li>
        <li>Project payments are held in escrow until milestones are approved</li>
        <li>Mentor sessions are charged at time of booking</li>
        <li>Assessment fees are charged before starting</li>
      </ul>
      
      <h3>Withdrawal Process</h3>
      <ol>
        <li>Go to your Earnings dashboard</li>
        <li>Click "Withdraw Funds"</li>
        <li>Select your withdrawal method (Bank/UPI)</li>
        <li>Enter amount and confirm</li>
        <li>Funds are transferred within 2-3 business days</li>
      </ol>
      
      <h3>Fees and Charges</h3>
      <ul>
        <li>Platform fee: 10% on completed projects</li>
        <li>Withdrawal fee: ₹10 + GST per transaction</li>
        <li>No charges for adding funds to wallet</li>
      </ul>
      
      <div class="bg-blue-50 p-4 rounded-lg mt-4">
        <p class="text-blue-800 font-medium">🔒 Secure Payments:</p>
        <p class="text-blue-700">All transactions are PCI-DSS compliant and encrypted. Your payment information is never stored on our servers.</p>
      </div>
    `,
    category: 'Payments',
    author: 'Finance Team',
    authorRole: 'InternHub Finance',
    publishedAt: '2024-01-10',
    updatedAt: '2024-01-25',
    readTime: 7,
    views: 2156,
    helpful: 167,
    notHelpful: 15,
    tags: ['payments', 'withdrawal', 'fees', 'banking'],
    relatedArticles: [
      { slug: 'how-to-apply-projects', title: 'How to Apply for Projects' },
      { slug: 'withdraw-earnings', title: 'Withdrawing Your Earnings' },
      { slug: 'trust-score-explained', title: 'Understanding Trust Score' },
    ],
  },
  'withdraw-earnings': {
    id: 'withdraw-earnings',
    title: 'Withdrawing Your Earnings',
    content: `
      <h2>How to Withdraw Your Funds</h2>
      <p>Once you've earned money on InternHub, you can withdraw it to your bank account or UPI. Here's how:</p>
      
      <h3>Eligibility</h3>
      <ul>
        <li>Minimum withdrawal amount: ₹500</li>
        <li>Funds must be cleared (not in escrow)</li>
        <li>Account must be verified</li>
      </ul>
      
      <h3>Step-by-Step Withdrawal Process</h3>
      
      <h4>Step 1: Go to Earnings Dashboard</h4>
      <p>Navigate to your dashboard and click on "Earnings" to see your available balance.</p>
      
      <h4>Step 2: Click "Withdraw Funds"</h4>
      <p>You'll see your available balance and withdrawal options.</p>
      
      <h4>Step 3: Choose Withdrawal Method</h4>
      <p>Select from:</p>
      <ul>
        <li><strong>Bank Transfer:</strong> Add your bank account details (account number, IFSC code)</li>
        <li><strong>UPI:</strong> Enter your UPI ID</li>
      </ul>
      
      <h4>Step 4: Enter Amount</h4>
      <p>Specify the amount you want to withdraw (minimum ₹500).</p>
      
      <h4>Step 5: Confirm and Submit</h4>
      <p>Review the details and confirm your withdrawal request.</p>
      
      <h3>Processing Time</h3>
      <ul>
        <li>UPI withdrawals: Usually processed within 24 hours</li>
        <li>Bank transfers: 2-3 business days</li>
      </ul>
      
      <h3>Withdrawal Status</h3>
      <p>You can track your withdrawal status in the Transactions section:</p>
      <ul>
        <li><strong>Pending:</strong> Request received, being processed</li>
        <li><strong>Processing:</strong> Being sent to your account</li>
        <li><strong>Completed:</strong> Successfully transferred</li>
        <li><strong>Failed:</strong> Issue with transfer - contact support</li>
      </ul>
      
      <div class="bg-green-50 p-4 rounded-lg mt-4">
        <p class="text-green-800 font-medium">💰 Pro Tip:</p>
        <p class="text-green-700">Withdrawals to UPI are faster! Consider using UPI for quicker access to your funds.</p>
      </div>
    `,
    category: 'Payments',
    author: 'Finance Team',
    authorRole: 'InternHub Finance',
    publishedAt: '2024-01-12',
    updatedAt: '2024-01-28',
    readTime: 5,
    views: 1654,
    helpful: 145,
    notHelpful: 9,
    tags: ['withdrawal', 'earnings', 'bank', 'upi'],
    relatedArticles: [
      { slug: 'payment-methods', title: 'Payment Methods Accepted' },
      { slug: 'how-to-apply-projects', title: 'How to Apply for Projects' },
      { slug: 'trust-score-explained', title: 'Understanding Trust Score' },
    ],
  },
};

export async function generateMetadata({ params }: HelpArticlePageProps): Promise<Metadata> {
  const article = articles[params.article as keyof typeof articles];
  
  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.title,
    description: article.content.substring(0, 160).replace(/<[^>]*>/g, ''),
    openGraph: {
      title: article.title,
      description: article.content.substring(0, 160).replace(/<[^>]*>/g, ''),
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags,
    },
  };
}

export default function HelpArticlePage({ params }: HelpArticlePageProps) {
  const article = articles[params.article as keyof typeof articles];

  if (!article) {
    notFound();
  }

  return (
    <div className="premium-shell min-h-screen bg-charcoal-100/50 dark:bg-transparent">
      {/* Header */}
      <div className="border-b border-white/55 bg-card/80 dark:border-white/10 dark:bg-charcoal-950/60">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/help"
            className="mb-4 inline-flex items-center text-charcoal-600 hover:text-charcoal-950 dark:text-charcoal-300 dark:hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Help Center
          </Link>
          
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="skill">{article.category}</Badge>
            <span className="text-sm text-charcoal-500">•</span>
            <span className="text-sm text-charcoal-500 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.readTime} min read
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal-950 mb-4">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{article.author}</p>
                  <p className="text-xs text-charcoal-500">{article.authorRole}</p>
                </div>
              </div>
              <div className="text-sm text-charcoal-500 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Updated {new Date(article.updatedAt).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Article Content */}
          <div className="lg:col-span-3">
            <Card className="p-8">
              <div 
                className="prose prose-lg max-w-none prose-headings:text-charcoal-950 prose-p:text-charcoal-700 prose-strong:text-charcoal-950 dark:prose-invert dark:prose-headings:text-white dark:prose-p:text-charcoal-300 dark:prose-strong:text-white"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags */}
              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-charcoal-400" />
                  {article.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/help/tag/${tag}`}
                      className="rounded-full bg-charcoal-100 px-3 py-1 text-sm text-charcoal-700 transition-colors hover:bg-charcoal-100 dark:bg-charcoal-900 dark:text-charcoal-300 dark:hover:bg-charcoal-800"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Helpful Section */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Was this article helpful?</h3>
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    Yes ({article.helpful})
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4" />
                    No ({article.notHelpful})
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  placeholder="Search help..."
                  className="pl-9"
                />
              </div>
            </Card>

            {/* Related Articles */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Related Articles</h3>
              <div className="space-y-2">
                {article.relatedArticles.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/help/${related.slug}`}
                    className="block rounded-md p-2 transition-colors hover:bg-charcoal-100/50 dark:hover:bg-charcoal-900/60"
                  >
                    <p className="text-sm text-charcoal-700 hover:text-primary-600 dark:text-charcoal-200 dark:hover:text-primary-300">
                      {related.title}
                    </p>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Need More Help */}
            <Card className="p-4 bg-primary-50">
              <HelpCircle className="h-8 w-8 text-primary-600 mb-2" />
              <h3 className="font-semibold mb-2">Still need help?</h3>
              <p className="mb-4 text-sm text-charcoal-600 dark:text-charcoal-300">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </p>
              <div className="space-y-2">
                <Button className="w-full" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Live Chat
                </Button>
              </div>
            </Card>

            {/* Article Info */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Article Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Author</span>
                  <span className="font-medium">{article.author}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Published</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Updated</span>
                  <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Views</span>
                  <span>{article.views.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
