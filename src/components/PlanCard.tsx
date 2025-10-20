// app/components/PlanCard.tsx
import React from 'react';
import Link from 'next/link';

interface PlanCardProps {
  title: string;
  price: string;
  features: string[];
  featured?: boolean;
  buttonText?: string;
  dir?: string;
}

export default function PlanCard({
  title,
  price,
  features,
  featured = false,
  buttonText = "Seleccionar Plan",
  dir = "/login",
}: PlanCardProps) {
  return (
    <div
      className={`
        p-8 rounded-xl border-2 shadow-md transform transition-all duration-300
        ${featured 
          ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white scale-105 shadow-xl' 
          : 'bg-white border-green-400 text-green-900 hover:shadow-xl hover:scale-105'
        }
      `}
    >
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className={`text-4xl font-bold mb-6 ${featured ? 'text-white' : 'text-green-800'}`}>{price}</p>
      <ul className="mb-8 space-y-2 text-left">
        {features.map((feature, idx) => (
          <li key={idx}>{feature}</li>
        ))}
      </ul>
     {/*<Link href="/login">*/ } 
    <Link href={dir}>
      <button
        className={`
          w-full py-2 px-4 rounded-lg font-bold transition duration-300
          ${featured 
            ? 'bg-white text-green-600 hover:bg-gray-100' 
            : 'bg-green-500 text-white hover:bg-green-600'
          }
        `}
      >       
          {buttonText}  
      </button>
    </Link>
    </div>
  );
}

