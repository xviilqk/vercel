// app/pets/[id]/page.tsx
import PetProfile from '@/app/petprofile/page';

interface PageProps {
  params: Promise<{ id: string }>; // ✅ gawin siyang Promise
}

async function fetchPet(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pets/${id}/`, {
    cache: 'no-store',
  });

  if (!res.ok) return null;

  const p = await res.json();

  return {
    id: p.id,
    name: p.name,
    breed: p.breed,
    age: p.age,
    gender: p.gender,
    size: p.size,
    color: p.color,
    healthCondition: p.healthCondition,
    story: p.story,
    status: p.status,
    type: p.type,
    vaccinated: p.vaccinated,
    details: `${p.gender} / ${p.age} / ${p.breed}`,
    image: p.image || '/images/dogcat.png',
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params; // ✅ await muna bago gamitin
  const pet = await fetchPet(id);

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">Pet not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Pass the fetched pet object to PetProfile */}
      <PetProfile pet={pet} />
    </div>
  );
}
