import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function SkillsChart({ skills, onSkillClick }) {
  const topSkills = skills.slice(0, 15);

  const data = {
    labels: topSkills.map(([name]) => name),
    datasets: [
      {
        label: "Job Count",
        data: topSkills.map(([, count]) => count),
        backgroundColor: topSkills.map((_, i) =>
          i === 0
            ? "#D4FF00"
            : i === 1
            ? "#C1E600"
            : i === 2
            ? "#AECC00"
            : "rgba(212, 255, 0, 0.3)"
        ),
        borderColor: "#D4FF00",
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: "#D4FF00",
        hoverBorderColor: "#FFFFFF",
      },
    ],
  };

  const options = {
    indexAxis: "y", // Horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(5, 5, 5, 0.9)",
        titleColor: "#D4FF00",
        bodyColor: "#FFFFFF",
        borderColor: "#222",
        borderWidth: 1,
        padding: 12,
        titleFont: {
          family: "Unbounded",
          size: 14,
        },
        bodyFont: {
          family: "Mulish",
          size: 13,
        },
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "#888",
          font: {
            family: "Mulish",
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#FFFFFF",
          font: {
            family: "Mulish",
            weight: "600",
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onSkillClick) {
        const index = elements[0].index;
        const skillName = data.labels[index];
        onSkillClick(skillName);
      }
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  return (
    <div className="h-[500px] w-full p-4">
      <Bar options={options} data={data} />
    </div>
  );
}
