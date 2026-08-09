export interface RecentChat {
  id: string;
  question: string;
  location: string;
  time: string;
}

export const mockRecentChats: RecentChat[] = [
  { id: "1", question: "Is the weather good for fungal growth?", location: "Stellenbosch", time: "Today, 08:45" },
  { id: "2", question: "Best time to irrigate tomatoes?", location: "Stellenbosch", time: "Yesterday, 16:30" },
  { id: "3", question: "How to control aphids on spinach?", location: "Stellenbosch", time: "2 days ago, 11:20" },
];
