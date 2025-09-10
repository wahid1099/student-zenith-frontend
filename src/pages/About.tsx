import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function About() {
  const team = [
    {
      name: 'Alex Johnson',
      role: 'Founder & CEO',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
      bio: 'Education technology enthusiast with 10+ years of experience in building learning platforms.',
    },
    {
      name: 'Sarah Williams',
      role: 'Head of Education',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
      bio: 'Former university professor passionate about making education accessible to all.',
    },
    {
      name: 'Michael Chen',
      role: 'Lead Developer',
      imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
      bio: 'Full-stack developer dedicated to creating seamless user experiences.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gray-900">
        <div className="relative h-80 overflow-hidden bg-indigo-600 md:absolute md:left-0 md:h-full md:w-1/3 lg:w-1/2">
          <img
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"
            alt="Team working together"
          />
          <div className="absolute inset-0 bg-indigo-700 mix-blend-multiply" />
        </div>
        <div className="relative mx-auto max-w-7xl py-24 sm:py-32 lg:py-40 lg:px-8">
          <div className="pr-6 pl-6 md:ml-auto md:w-2/3 md:pl-16 lg:w-1/2 lg:pl-24 lg:pr-0 xl:pl-32">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">Who we are</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Empowering the next generation of learners</p>
            <p className="mt-6 text-base leading-7 text-gray-300">
              At StudentZenith, we believe that every student deserves access to quality education and the tools to succeed. 
              Our platform is built by educators, for students, with the goal of making learning more accessible, engaging, and effective.
            </p>
            <div className="mt-8">
              <Button asChild variant="secondary">
                <Link to="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Mission</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              To revolutionize the way students learn by providing innovative tools that make education more accessible, 
              engaging, and effective for everyone, everywhere.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:gap-x-16">
            <div>
              <h3 className="border-l border-indigo-600 pl-6 font-semibold text-gray-900">Our Values</h3>
              <ul role="list" className="mt-6 space-y-6">
                {[
                  'Student-first approach in everything we do',
                  'Commitment to educational excellence',
                  'Innovation through technology',
                  'Accessibility for all learners',
                  'Data-driven improvements',
                  'Community and collaboration',
                ].map((value) => (
                  <li key={value} className="flex gap-x-3">
                    <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    {value}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="border-l border-indigo-600 pl-6 font-semibold text-gray-900">Our Approach</h3>
              <p className="mt-6">
                We combine cutting-edge technology with educational best practices to create tools that adapt to each student's 
                unique learning style and pace. Our platform is continuously improved based on user feedback and the latest 
                educational research.
              </p>
              <p className="mt-6">
                We're committed to making education more accessible by providing free and affordable learning resources 
                to students around the world, regardless of their background or location.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our team</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We're a dynamic group of individuals who are passionate about education and technology.
            </p>
          </div>
          <ul
            role="list"
            className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3"
          >
            {team.map((person) => (
              <li key={person.name}>
                <img className="aspect-[3/2] w-full rounded-2xl object-cover" src={person.imageUrl} alt="" />
                <h3 className="mt-6 text-lg font-semibold leading-8 tracking-tight text-gray-900">{person.name}</h3>
                <p className="text-base leading-7 text-indigo-600">{person.role}</p>
                <p className="mt-4 text-base leading-7 text-gray-600">{person.bio}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="mx-auto max-w-2xl py-16 px-4 text-center sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to start your learning journey?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Join thousands of students who are already achieving their academic goals with our platform.
          </p>
          <Button asChild className="mt-8 w-full bg-white text-indigo-600 hover:bg-indigo-50 sm:w-auto">
            <Link to="/register">Get started today</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
