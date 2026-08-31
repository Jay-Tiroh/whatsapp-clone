// features/discovery/mocks/discovery.mocks.ts
import type { ContactMatchDto } from "../../contacts/types/discovery.types";

const realisticNames = [
  "Boluwatife Adeyemi",
  "Chinedu Eze",
  "Amina Yusuf",
  "Sarah Jenkins",
  "Michael Ojo",
  "Esther Nwachukwu",
  "David Smith",
  "Folashade Coker",
  "Tobi Bakre",
  "Grace Okafor",
  "Emeka Obi",
  "Jessica Mensah",
  "Samuel Jackson",
  "Fatima Aliyu",
  "Zainab Bello",
  "Ibrahim Musa",
  "Oluwaseun Awolowo",
  "Ngozi Adeleke",
  "Kelechi Iheanacho",
  "Tunde Ednut",
  "Victoria Davies",
  "Emmanuel Cole",
  "Adebayo Salami",
  "Chioma Rowland",
  "Segun Arinze",
  "Funke Akindele",
];

export const mockContactMatches: ContactMatchDto[] = [
  {
    matchedPhoneNumber: "+2348012345678",
    user: {
      id: "user_10",
      displayName: "Mom",
      avatarUrl: "https://i.pravatar.cc/150?u=user_10",
    },
  },
  {
    matchedPhoneNumber: "+2348023456789",
    user: {
      id: "user_11",
      displayName: "Sir Albert",
      avatarUrl: null,
    },
  },
  {
    matchedPhoneNumber: "+2348034567890",
    user: {
      id: "user_12",
      displayName: "Cody Fisher",
      avatarUrl: "https://i.pravatar.cc/150?u=user_12",
    },
  },
  // Map the realistic names to simulate "26+ more contacts"
  ...realisticNames.map((name, i) => ({
    matchedPhoneNumber: `+23481${String(i + 10000000).padStart(8, "0")}`, // Generates realistic looking Nigerian numbers
    user: {
      id: `user_${100 + i}`,
      displayName: name,
      // Randomly assign avatars to roughly 50% of the generated contacts
      avatarUrl:
        i % 2 === 0 ? `https://i.pravatar.cc/150?u=user_${100 + i}` : null,
    },
  })),
];
