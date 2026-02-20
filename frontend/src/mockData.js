// Mock data for SkyLux Airlines

export const destinations = [
  {
    id: 1,
    city: "Paris",
    country: "France",
    image: "https://images.pexels.com/photos/4310975/pexels-photo-4310975.jpeg",
    price: 899,
    description: "Experience the city of lights and romance"
  },
  {
    id: 2,
    city: "Dubai",
    country: "UAE",
    image: "https://images.pexels.com/photos/29470839/pexels-photo-29470839.jpeg",
    price: 1299,
    description: "Luxury shopping and modern architecture"
  },
  {
    id: 3,
    city: "Tokyo",
    country: "Japan",
    image: "https://images.pexels.com/photos/31258209/pexels-photo-31258209.jpeg",
    price: 1499,
    description: "Blend of tradition and innovation"
  },
  {
    id: 4,
    city: "New York",
    country: "USA",
    image: "https://images.pexels.com/photos/33987758/pexels-photo-33987758.jpeg",
    price: 799,
    description: "The city that never sleeps"
  },
  {
    id: 5,
    city: "Maldives",
    country: "Maldives",
    image: "https://images.pexels.com/photos/28843931/pexels-photo-28843931.jpeg",
    price: 1899,
    description: "Paradise islands and crystal waters"
  },
  {
    id: 6,
    city: "Singapore",
    country: "Singapore",
    image: "https://images.unsplash.com/photo-1472148439583-1f4cf81b80e0",
    price: 1199,
    description: "Modern city-state with vibrant culture"
  }
];

export const features = [
  {
    id: 1,
    title: "Premium Comfort",
    description: "Experience unparalleled luxury with spacious seating and premium amenities in all classes"
  },
  {
    id: 2,
    title: "Global Network",
    description: "Fly to over 200 destinations worldwide with seamless connections"
  },
  {
    id: 3,
    title: "Award-Winning Service",
    description: "Recognized globally for exceptional in-flight service and hospitality"
  },
  {
    id: 4,
    title: "Exclusive Lounges",
    description: "Relax in our luxurious airport lounges with premium dining and facilities"
  },
  {
    id: 5,
    title: "Business Class",
    description: "Flat-bed seating, gourmet cuisine, and priority boarding for business travelers"
  },
  {
    id: 6,
    title: "Loyalty Rewards",
    description: "Earn miles and enjoy exclusive benefits with our SkyLux Rewards program"
  }
];

export const flightClasses = [
  { value: "economy", label: "Economy" },
  { value: "premium-economy", label: "Premium Economy" },
  { value: "business", label: "Business Class" },
  { value: "first", label: "First Class" }
];

export const popularRoutes = [
  { from: "New York", to: "London" },
  { from: "Los Angeles", to: "Tokyo" },
  { from: "Dubai", to: "Singapore" },
  { from: "Paris", to: "New York" }
];
