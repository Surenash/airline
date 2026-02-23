// Mock data for SkyLux Airlines

export const destinations = [
  {
    id: 1,
    city: "New York",
    code: "JFK",
    country: "USA",
    image: "https://images.pexels.com/photos/2190283/pexels-photo-2190283.jpeg",
    price: 799,
    description: "Experience the pulse of the world's most iconic skyline."
  },
  {
    id: 2,
    city: "London",
    code: "LHR",
    country: "UK",
    image: "https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg",
    price: 849,
    description: "Historic charm meets modern elegance in the heart of Britain."
  },
  {
    id: 3,
    city: "Dubai",
    code: "DXB",
    country: "UAE",
    image: "https://images.pexels.com/photos/2047333/pexels-photo-2047333.jpeg",
    price: 1299,
    description: "Luxury shopping, desert adventures, and gravity-defying architecture."
  },
  {
    id: 4,
    city: "Paris",
    code: "CDG",
    country: "France",
    image: "https://images.pexels.com/photos/4310975/pexels-photo-4310975.jpeg",
    price: 899,
    description: "The city of lights, world-class art, and culinary perfection."
  },
  {
    id: 5,
    city: "Singapore",
    code: "SIN",
    country: "Singapore",
    image: "https://images.pexels.com/photos/777059/pexels-photo-777059.jpeg",
    price: 1199,
    description: "A tropical garden city where futuristic skylines meet nature."
  },
  {
    id: 6,
    city: "Tokyo",
    code: "NRT",
    country: "Japan",
    image: "https://images.pexels.com/photos/161401/pexels-photo-161401.jpeg",
    price: 1499,
    description: "Vibrant neon lights and centuries-old traditions in perfect harmony."
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
