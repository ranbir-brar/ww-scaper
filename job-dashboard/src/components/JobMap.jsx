import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

export default function JobMap({ jobs }) {
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
    if (avgSalary >= 30) return "#10b981";
    if (avgSalary >= 20) return "#f59e0b";
    if (avgSalary > 0) return "#f43f5e";
    return "#3b82f6";
  };

  if (validJobs.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Job Locations
        </h3>
        <div className="h-64 flex items-center justify-center text-[var(--color-text-muted)]">
          No location data available
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
        Job Locations
      </h3>
      <div className="h-64 rounded-lg overflow-hidden">
        <MapContainer
          center={[45.5, -75.0]}
          zoom={4}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          />
          {groupedByLocation.map((group, index) => (
            <CircleMarker
              key={index}
              center={[group.lat, group.lng]}
              radius={Math.min(8 + group.jobs.length * 2, 20)}
              fillColor={getMarkerColor(group.jobs)}
              fillOpacity={0.7}
              stroke={true}
              color="#ffffff"
              weight={2}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold text-[var(--color-text-primary)]">
                    {group.city}
                  </p>
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
      <div className="flex items-center justify-center gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
          <span className="text-[var(--color-text-muted)]">High ($30+)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
          <span className="text-[var(--color-text-muted)]">
            Medium ($20-30)
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#f43f5e]"></div>
          <span className="text-[var(--color-text-muted)]">Low (&lt;$20)</span>
        </div>
      </div>
    </div>
  );
}
