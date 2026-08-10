export interface Alert {
  id: string;
  icon: "rainy" | "warning" | "bug" | "leaf" | "thermometer";
  tone: "primary" | "warning" | "danger" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const mockAlerts: Alert[] = [
  {
    id: "1",
    icon: "rainy",
    tone: "info",
    title: "Heavy rain expected",
    message: "42mm of rainfall forecast over the next 3 days in Stellenbosch. Consider delaying spraying.",
    time: "Today, 08:45",
    read: false,
  },
  {
    id: "2",
    icon: "bug",
    tone: "warning",
    title: "Aphid activity on East Field",
    message: "Early aphid signs reported on Green Beans. Scout before your next spray window.",
    time: "Today, 07:12",
    read: false,
  },
  {
    id: "3",
    icon: "warning",
    tone: "danger",
    title: "High fungal risk",
    message: "Humidity above 85% expected this week — elevated fungal disease risk for Tomatoes.",
    time: "Yesterday, 16:30",
    read: false,
  },
  {
    id: "4",
    icon: "leaf",
    tone: "primary",
    title: "Spinach ready to harvest",
    message: "South Field spinach has reached maturity. Plan your harvest window this week.",
    time: "2 days ago, 11:20",
    read: true,
  },
  {
    id: "5",
    icon: "thermometer",
    tone: "info",
    title: "Mild frost risk overnight",
    message: "Minimum temperatures may dip close to 2°C on Thursday night.",
    time: "3 days ago, 19:05",
    read: true,
  },
];
