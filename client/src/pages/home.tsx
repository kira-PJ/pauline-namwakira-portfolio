import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { ExperienceSection } from "@/components/experience-section";
import { CertificationsSection } from "@/components/certifications-section";
import { CoursesSection } from "@/components/courses-section";
import { YoutubeSection } from "@/components/youtube-section";
import { TestimonialsSection } from "@/components/testimonials-simple";
import { ContactSection } from "@/components/contact-section";
import { PageFooter } from "@/components/page-footer";
import { GallerySection } from "@/components/gallery-section";
import { AnimatedBackground } from "@/components/animated-background";
import { GalaxyBackground } from "@/components/galaxy-background";
import { ThemeToggle } from "@/components/theme-toggle";


import { Helmet } from "react-helmet";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Pauline Namwakira - AWS Authorized Instructor</title>
        <meta name="description" content="Pauline Namwakira is an AWS Authorized Instructor with 4+ years of experience, based in Nairobi, Kenya, specializing in cloud architecture, security, and training. Explore courses, certifications, and cloud solutions." />
        <meta property="og:title" content="Pauline Namwakira - AWS Authorized Instructor" />
        <meta property="og:description" content="Expert AWS training and cloud computing solutions by Pauline Namwakira, an AWS Authorized Instructor with 4+ years of comprehensive cloud expertise." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://paulinenamwakira.com" />
        <meta property="og:image" content="https://paulinenamwakira.com/profile-social.svg?v=20250531" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Pauline Namwakira - AWS Authorized Instructor" />
        <meta property="og:site_name" content="Pauline Namwakira Portfolio" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pauline Namwakira - AWS Authorized Instructor" />
        <meta name="twitter:description" content="Expert AWS training and cloud computing solutions by Pauline Namwakira, an AWS Authorized Instructor with 4+ years of comprehensive cloud expertise." />
        <meta name="twitter:image" content="https://paulinenamwakira.com/profile-social.svg?v=20250531" />
        <meta name="twitter:image:alt" content="Pauline Namwakira - AWS Authorized Instructor" />
        
        {/* Additional meta tags */}
        <meta name="author" content="Pauline Namwakira" />
        <meta name="keywords" content="AWS, cloud computing, training, instructor, certification, Nairobi, Kenya, cloud architecture" />
      </Helmet>
    
      <GalaxyBackground />
      <ThemeToggle />
      <SiteHeader />
      <main className="relative z-10">
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <CertificationsSection />
        <CoursesSection />
        <YoutubeSection />
        <TestimonialsSection />
        <ContactSection />
        <GallerySection />
      </main>
      <PageFooter />
    </>
  );
}
