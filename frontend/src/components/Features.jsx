import React from 'react';
import { Armchair, Globe, Award, Coffee, Briefcase, Gift } from 'lucide-react';
import { features } from '../mockData';

const iconMap = {
  0: Armchair,
  1: Globe,
  2: Award,
  3: Coffee,
  4: Briefcase,
  5: Gift
};

const Features = () => {
  return (
    <div id="offers" className="py-24 px-6 bg-slate-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Why Choose SkyLux
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Experience the difference with our premium services and world-class amenities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = iconMap[index];
            return (
              <div
                key={feature.id}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-200"
              >
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                    <Icon className="h-8 w-8" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative Element */}
                <div className="mt-6 h-1 w-0 bg-amber-500 group-hover:w-12 transition-all duration-500 rounded-full"></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Features;
