const productionHostname = "ricomanifesto.com";

if (
  window.location.hostname === productionHostname
  && !document.querySelector("script[data-cf-beacon]")
) {
  const beacon = document.createElement("script");
  beacon.defer = true;
  beacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
  beacon.dataset.cfBeacon = JSON.stringify({
    token: "ea10f00f44df4f92a4479cf7b4fe334f",
  });
  document.head.append(beacon);
}
