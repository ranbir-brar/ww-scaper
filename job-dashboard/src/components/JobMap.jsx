import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

export default function JobMap({ jobs, fullPage = false }) {
  const validJobs = useMemo(
    () => jobs.filter((job) => job.location?.lat && job.location?.lng),
    [jobs]
  );

  const groupedByLocation = useMemo(() => {
    const groups = {};
    validJobs.forEach((job) => {
      const key = `${job.location.lat},${job.location.lng}`;
      if (!groups[key]) {
        groups[key] = {
          lat: job.location.lat,
          lng: job.location.lng,
          city: job.city,
          jobs: [],
        };
      }
      groups[key].jobs.push(job);
    });
    return Object.values(groups);
  }, [validJobs]);

  const getMarkerColor = (jobs) => {
    const avgSalary =
      jobs.reduce((sum, j) => sum + (j.salary?.avg || 0), 0) / jobs.length;
    if (avgSalary >= 30) return "#22c55e";
    if (avgSalary >= 20) return "#f59e0b";
    if (avgSalary > 0) return "#ef4444";
    return "#0f766e";
  };

  if (validJobs.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-[var(--color-text-muted)] ${
          fullPage ? "h-full" : "h-64"
        }`}
      >
        No location data available
      </div>
    );
  }

  return (
    <div className={fullPage ? "h-full" : "h-64"}>
      <MapContainer
        center={[45.5, -75.0]}
        zoom={4}
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {groupedByLocation.map((group, index) => (
          <CircleMarker
            key={index}
            center={[group.lat, group.lng]}
            radius={Math.min(6 + group.jobs.length * 1.5, 18)}
            fillColor={getMarkerColor(group.jobs)}
            fillOpacity={0.7}
            stroke={true}
            color="#ffffff"
            weight={2}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{group.city}</p>
                <p className="text-[var(--color-text-muted)]">
                  {group.jobs.length} job{group.jobs.length > 1 ? "s" : ""}
                </p>
                <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {group.jobs.slice(0, 5).map((job) => (
                    <li key={job.id} className="text-xs truncate">
                      {job.title}
                    </li>
                  ))}
                  {group.jobs.length > 5 && (
                    <li className="text-xs text-[var(--color-text-muted)]">
                      +{group.jobs.length - 5} more
                    </li>
                  )}
                </ul>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
