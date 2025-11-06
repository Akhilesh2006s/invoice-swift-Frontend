import FeatureCard from "./FeatureCard";

const FeaturesSection = () => {
  const features = [
    {
      title: "Quick Setup",
      description: "Get started in minutes with our simple onboarding process.",
      icon: "⚡"
    },
    {
      title: "Analytics",
      description: "Track your revenue and payment status with detailed analytics.",
      icon: "📊"
    },
    {
      title: "Secure",
      description: "Your data is protected with enterprise-grade security.",
      icon: "🔒"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Why Choose Invoice Swift?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform is designed to make invoice management simple, efficient, and secure.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;


