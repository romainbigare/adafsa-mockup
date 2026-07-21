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
    nav: {
      groups: [
        {
          label: "FOR GOVERNMENT",
          links: [
            { id: "dashboard", label: "Live Dashboard", icon: "dashboard", href: "index.html" },
            { id: "farm-analysis", label: "Farm Analysis", icon: "analytics", href: "farm-analysis.html" },
            { id: "violations", label: "Violation Management", icon: "gavel", href: "violation-management.html" }
          ]
        },
        {
          label: "FOR FARMERS",
          links: [
            { id: "my-farm", label: "My Farm", icon: "agriculture", href: "farm-analysis.html" }
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
