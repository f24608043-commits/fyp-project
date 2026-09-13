import { Button } from "@/components/ui/button";

export const Footer = () => {
  // Static course categories matching seeded data
  const courses = [
    "Python Programming",
    "Web Development",
    "Data Science",
    "Machine Learning",
    "Mobile Development"
  ];

  return (
    <div className="hidden h-24 w-full border-t-2 border-primary-100 bg-white/50 backdrop-blur-sm p-4 lg:block">
      <div className="mx-auto flex h-full max-w-screen-lg items-center justify-evenly gap-4">
        {courses.map((course) => (
          <Button 
            key={course} 
            size="lg" 
            variant="ghost" 
            className="w-full font-heading font-bold text-primary-700 hover:bg-primary-50 rounded-2xl cursor-pointer"
          >
            {course}
          </Button>
        ))}
      </div>
    </div>
  );
};
