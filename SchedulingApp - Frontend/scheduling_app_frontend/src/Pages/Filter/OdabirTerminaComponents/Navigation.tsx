interface NavigationProps {
  activeTab: number;
  menuVisible: boolean;
  onTabChange: (tabIndex: number) => void;
}

export default function Navigation({
  activeTab,
  menuVisible,
  onTabChange,
}: NavigationProps) {

  const tabs = [
    { icon: "bi-hdd-fill", label: "Odaberi teren" },
    { icon: "bi-calendar-event", label: "Datum & Vreme" },
    { icon: "bi-file-earmark-text", label: "Kontakt podaci" },
    { icon: "bi-check2-square", label: "Vaša rezervacija" },
  ];

  return (
    <div
      className={`navigation rounded shadow p-3 mb-3 ${
        menuVisible ? "slide-in-left" : "invisible"
      }`}
    >
      <ul className="list-group list-group-horizontal-md w-100 justify-content-center text-center">
        {tabs.map((tab, index) => (
          <li
            key={index}
            className="list-group-item"
            style={{ cursor: "pointer" }}
            onClick={() => onTabChange(index)}
          >
            <i
              className={`bi ${tab.icon} me-2`}
              style={{ color: activeTab === index ? "#26a172" : "" }}
            ></i>
            <span style={{ color: activeTab === index ? "#26a172" : "" }}>
              {tab.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
