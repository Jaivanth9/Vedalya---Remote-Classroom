import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Video, 
  Bot, 
  Languages, 
  BookOpen, 
  BarChart3, 
  Users,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Moon,
  Sun,
  LogOut
} from "lucide-react";
import heroImage from "@/assets/hero-education.jpg";
import FeatureShowcase from "@/components/FeatureShowcase";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";

const Index = () => {
  const { user, signOut, getUserRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleGoToDashboard = async () => {
    if (user) {
      const userRole = await getUserRole();
      if (userRole) {
        navigate(`/dashboard/${userRole}`);
      }
    }
  };
  const handleFeatureClick = (featureTitle: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    // Navigate to appropriate dashboard section based on feature
    if (featureTitle.includes("Classes")) {
      // Will scroll to classes section in dashboard
      navigate("/auth");
    } else if (featureTitle.includes("Chatbot")) {
      // Chatbot is available everywhere
      return;
    } else {
      navigate("/auth");
    }
  };

  const features = [
    {
      icon: Video,
      title: "Live & Recorded Classes",
      description: "Attend live sessions or access recorded lectures anytime, anywhere with subtitles and translations.",
      link: "classes"
    },
    {
      icon: Bot,
      title: "AI-Powered Chatbot",
      description: "Get instant doubt clarification in multiple languages with our intelligent learning assistant.",
      link: "chatbot"
    },
    {
      icon: Languages,
      title: "Multilingual Support",
      description: "Learn in your preferred language - English, Hindi, or Telugu with seamless translation.",
      link: "multilingual"
    },
    {
      icon: BookOpen,
      title: "Personalized Learning",
      description: "AI-generated roadmaps and study plans tailored to your learning pace and goals.",
      link: "learning"
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Track progress with detailed insights and performance metrics to improve outcomes.",
      link: "analytics"
    },
    {
      icon: Users,
      title: "Interactive Community",
      description: "Connect with peers and teachers in discussion forums for collaborative learning.",
      link: "community"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Sign Up",
      description: "Choose your role (Student, Teacher, or Admin) and create your account in seconds."
    },
    {
      number: "02",
      title: "Explore Courses",
      description: "Browse courses, enroll in subjects, and access personalized learning paths."
    },
    {
      number: "03",
      title: "Learn & Grow",
      description: "Attend classes, complete assignments, and track your progress with AI insights."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-300">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Veदlya
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hover:scale-110 transition-transform duration-300"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
              {user ? (
                <>
                  <Button 
                    onClick={handleGoToDashboard}
                    className="hover:scale-105 transition-transform duration-300"
                  >
                    Go to Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut}
                    className="hover:scale-105 transition-transform duration-300"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" className="hover:scale-105 transition-transform duration-300">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="hero" className="hover:scale-105 transition-all duration-300">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Smart Remote Learning Ecosystem
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Empowering Rural Education through{" "}
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  Smart Learning
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Access quality higher education from anywhere. AI-powered learning, multilingual support, 
                and personalized paths designed for rural students.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  variant="hero" 
                  className="group hover:scale-105 transition-all duration-300"
                  onClick={() => navigate('/auth')}
                >
                  Start Learning
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="hover:scale-105 transition-all duration-300"
                  onClick={() => navigate('/auth')}
                >
                  I'm a Teacher
                </Button>
              </div>
            </div>
            <div className="relative animate-scale-in hover:scale-105 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full"></div>
              <img 
                src={heroImage} 
                alt="Students learning together" 
                className="relative rounded-2xl shadow-2xl w-full hover:shadow-card transition-shadow duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Slideshow */}
      <FeatureShowcase />

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and features designed to make learning accessible, 
              engaging, and effective for every student.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-border hover:shadow-card transition-all duration-300 hover:-translate-y-2 hover:scale-105 animate-slide-up group cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleFeatureClick(feature.title)}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                    <feature.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How Veदlya Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started with Veदlya in three simple steps and begin your learning journey today.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative animate-fade-in group" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="text-center space-y-4">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-xl rounded-full group-hover:opacity-30 transition-opacity duration-300"></div>
                    <div className="relative h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl font-bold text-white">{step.number}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Join thousands of students already benefiting from smart, accessible education.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="group hover:scale-105 transition-all duration-300">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Veदlya</span>
              </div>
              <p className="text-muted-foreground">
                Empowering rural education through smart learning technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/auth" className="hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block">About</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block">Courses</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/auth" className="hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block">Contact</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block">Help Center</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/auth" className="hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block">Privacy Policy</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
            <p>&copy; 2025 Veदlya. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
