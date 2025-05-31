import { useState } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
  FaGithub
} from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactSection() {
  const { ref, isInView } = useIntersectionObserver();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const { toast } = useToast();
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "Thanks for reaching out. I'll get back to you soon.",
        variant: "default",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData);
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="py-20 bg-white dark:bg-gray-900"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center dark:text-white text-gray-900">Get in Touch</h2>
        
        <div className="flex flex-col md:flex-row gap-10">
          <div className="md:w-1/2">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-md h-full">
              <h3 className="text-2xl font-semibold mb-6 dark:text-white text-gray-900">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="text-primary text-xl mr-4">
                    <FaEnvelope />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 dark:text-white text-gray-900">Email</h4>
                    <p className="text-gray-600 dark:text-gray-300">jpauline254@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="text-primary text-xl mr-4">
                    <FaPhone />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 dark:text-white text-gray-900">Phone</h4>
                    <p className="text-gray-600 dark:text-gray-300">+254 792 730 128</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="text-primary text-xl mr-4">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 dark:text-white text-gray-900">Location</h4>
                    <p className="text-gray-600 dark:text-gray-300">Nairobi, Kenya</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="text-primary text-xl mr-4">
                    <FaCalendarAlt />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 dark:text-white text-gray-900">Availability</h4>
                    <p className="text-gray-600 dark:text-gray-300">Monday - Friday, 9:00 AM - 5:00 PM PST</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="font-semibold mb-4 dark:text-white text-gray-900">Connect with me</h4>
                <div className="flex space-x-4">
                  <a
                    href="https://www.linkedin.com/in/paulinenamwakira/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-blue-700 transition-colors duration-300"
                  >
                    <FaLinkedinIn />
                  </a>
                  <a
                    href="https://www.youtube.com/@kiracloudhub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-blue-700 transition-colors duration-300"
                  >
                    <FaYoutube />
                  </a>
                  <a
                    href="https://github.com/kira-PJ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-blue-700 transition-colors duration-300"
                  >
                    <FaGithub />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <form className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-md" onSubmit={handleSubmit}>
              <h3 className="text-2xl font-semibold mb-6 dark:text-white text-gray-900">Send Me a Message</h3>
              
              <div className="mb-6">
                <label htmlFor="name" className="block text-gray-600 dark:text-gray-300 mb-2 font-medium">Name</label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-600 dark:text-gray-300 mb-2 font-medium">Email</label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="subject" className="block text-gray-600 dark:text-gray-300 mb-2 font-medium">Subject</label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-gray-600 dark:text-gray-300 mb-2 font-medium">Message</label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
                disabled={isPending}
              >
                {isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
