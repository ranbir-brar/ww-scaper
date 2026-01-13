import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export default function SalaryChart({ jobs, onBarClick }) {
  const data = useMemo(() => {
    const ranges = {
      "$0-15": 0,
      "$15-20": 0,
      "$20-25": 0,
      "$25-30": 0,
      "$30-40": 0,
      "$40+": 0,
    };

    let notSpecifiedCount = 0;

    jobs.forEach((job) => {
      if (!job.salary) {
        notSpecifiedCount++;
      } else {
        const avg = job.salary.avg;
        if (avg < 15) ranges["$0-15"]++;
        else if (avg < 20) ranges["$15-20"]++;
        else if (avg < 25) ranges["$20-25"]++;
        else if (avg < 30) ranges["$25-30"]++;
        else if (avg < 40) ranges["$30-40"]++;
        else ranges["$40+"]++;
      }
    });

    return {
      labels: Object.keys(ranges),
      datasets: [
        {
          label: "Number of Jobs",
          data: Object.values(ranges),
          backgroundColor: Object.keys(ranges).map((_, i) =>
            // Gradient-like effect manually applied to bars
            i === 0
              ? "rgba(212, 255, 0, 0.3)"
              : i === 1
              ? "rgba(212, 255, 0, 0.5)"
              : i === 2
              ? "rgba(212, 255, 0, 0.7)"
              : i === 3
              ? "#D4FF00"
              : i === 4
              ? "#AECC00"
              : "#8C9900"
          ),
          borderRadius: 4,
          borderWidth: 0,
          hoverBackgroundColor: "#FFFFFF",
        },
      ],
    };
  }, [jobs]);

  const options = {
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
        callbacks: {
          label: (context) => `${context.raw} jobs`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
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
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "#888",
          font: {
            family: "Mulish",
          },
          stepSize: 1,
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onBarClick) {
        const index = elements[0].index;
        const range = data.labels[index];
        onBarClick(range);
      }
    },
    onHover: (event, elements) => {
      event.native.target.style.cursor =
        elements.length > 0 ? "pointer" : "default";
    },
    animation: {
      duration: 800,
      easing: "easeOutQuart",
    },
  };

  return (
    <div className="h-[300px] w-full mt-4">
      <Bar options={options} data={data} />
    </div>
  );
}
