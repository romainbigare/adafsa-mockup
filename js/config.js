(function (W) {
  "use strict";

  W.config = {
    logoUrl: "https://farm-monitoring-adafsa.mapmycrop.in/images/logo1.png",
    map: {
      tiles: {
        satellite: {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          options: { maxZoom: 19, attribution: "&copy; Esri" }
        },
        street: {
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          options: { maxZoom: 19, attribution: "&copy; OpenStreetMap" }
        }
      },
      defaults: { center: [23.85, 53.78], zoom: 10 }
    },
    // Proposal A — the nav sells the six contract modules by name. Module links
    // point at hash routes on index.html (the SPA shell); the router marks the
    // active one. Overview is the Home scorecard; Farm Analysis is the drill-down.
    nav: {
      groups: [
        {
          label: "",
          links: [
            { id: "overview", label: "Overview", icon: "dashboard", href: "index.html#/overview" }
          ]
        },
        {
          label: "MODULES",
          links: [
            { id: "crop", label: "Crop Monitoring", icon: "grass", href: "index.html#/m/crop" },
            { id: "palms", label: "Palms & Fruit Trees", icon: "park", href: "index.html#/m/palms" },
            { id: "structures", label: "Structures", icon: "home_work", href: "index.html#/m/structures" },
            { id: "ier", label: "Irrigation Efficiency", icon: "water_drop", href: "index.html#/m/ier" },
            { id: "yield", label: "Yield Forecast", icon: "agriculture", href: "index.html#/m/yield" },
            { id: "water", label: "Water Allocation", icon: "opacity", href: "index.html#/m/water" }
          ]
        },
        {
          label: "DRILL-DOWN",
          links: [
            { id: "farm-analysis", label: "Farm Analysis", icon: "analytics", href: "farm-analysis.html" }
          ]
        }
      ],
      footer: [
        { label: "Support", icon: "support_agent", href: "#" },
        { label: "Logout", icon: "logout", href: "#" }
      ]
    },
    ticker: {
      status: "SYS.OP.NORMAL",
      coords: "LAT: 23.8487° N | LNG: 53.7829° E | ELV: 143M"
    }
  };

})(window.Wafra);
