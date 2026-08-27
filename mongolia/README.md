# Mongolia Rangeland Watch

Research prototype for transparent grazing decision support in Mongolia.

## Current evidence layers

- **Sentinel-2 L2A** (Microsoft Planetary Computer): point-scale B04/B08 surface reflectance and Scene Classification Layer (SCL) for current NDVI screening.
- **Same-season local baseline:** valid Sentinel-2 observations from approximately the same calendar period in up to five previous years. A relative vegetation class is only shown when at least three prior years are available.
- **NASA GIBS MODIS Terra 8-day NDVI:** national visualization context only. It is explicitly not treated as a grazing recommendation.
- **Open-Meteo:** recent precipitation, reference evapotranspiration and modelled near-surface soil moisture. These variables are labelled as model/analysis fields rather than satellite observations.
- **Mongolia recovery classes I–V:** can be supplied by the user when known and are treated as an ecological constraint that can override temporary greenness.

## Current decision rules

The site separates two questions:

1. **What is the vegetation signal now relative to this location's recent same-season history?**
2. **Does ecological recovery status permit routine grazing?**

A positive NDVI anomaly never overrides a severe recovery class. If recovery status is unknown, the prototype provides satellite screening rather than a definitive grazing authorization.

The application does **not** create legal closures. A future authoritative government closure layer should be represented separately from ecological recommendations.

## What is intentionally not implemented yet

- Livestock carrying capacity or animal-unit-day estimates from NDVI alone.
- Automatic legal grazing bans.
- A national recovery-class raster inferred from satellite data.
- Unvalidated biomass conversion coefficients.

## Validation priorities before operational use

1. Connect official spatial recovery-class / ecological-site information from Mongolia's national monitoring system.
2. Connect authoritative temporary and permanent grazing restrictions.
3. Calibrate satellite vegetation metrics to field-measured usable forage by ecological site, season and year.
4. Replace single-pixel NDVI with a robust local neighborhood statistic and quantify spatial uncertainty.
5. Validate recommendations retrospectively against NAMEM/GALAGC field observations and prospectively with herders and local rangeland specialists.
6. Add livestock class, herd size, water access, distance and seasonal-use constraints only after the forage-demand and utilization assumptions are agreed and documented.
7. Publish model version, thresholds, validation data and uncertainty for every operational release.

## Status

Version 0.1 is a **research screening prototype**, not an operational regulatory tool.
