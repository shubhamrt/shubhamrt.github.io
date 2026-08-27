# Mongolia Rangeland Watch

Version 0.2 research prototype for transparent grazing decision support in Mongolia.

## What the model returns

Every successful point assessment returns one explicit provisional recommendation:

- **GRAZE**
- **GRAZE CAUTIOUSLY**
- **DO NOT GRAZE / REST**

The recommendation is ecological decision support, not a legal closure and not a stocking-rate authorization.

## Evidence layers and native resolution

- **Sentinel-2 L2A (~10 m):** B04/B08 surface reflectance and Scene Classification Layer for current NDVI.
- **Same-season Sentinel-2 history (~10 m):** up to five prior years around the same calendar period. Three valid prior years are required for the full anomaly classification.
- **Copernicus DEM GLO-30 (~30 m):** local elevation and slope estimated from neighbouring DEM samples.
- **SoilGrids (~250 m):** 0–5 cm sand, silt, clay and soil organic carbon. USDA surface texture is derived from these fractions.
- **Open-Meteo:** recent precipitation, reference evapotranspiration, modelled near-surface soil moisture and recent wind gust context.
- **Mongolia recovery classes I–V:** optional field/official constraint. Classes IV–V are hard rest/restoration constraints in the current model.
- **NASA GIBS MODIS Terra 8-day NDVI:** national visualization context only, not a decision input.

The model does not resample a 250 m soil prediction to 10 m and claim 10 m soil knowledge. A soil-informed point decision therefore has an effective soil-information scale of about 250 m even though vegetation and terrain evidence are finer.

## Soil erodibility

Surface sand, silt, clay and organic carbon are used to estimate the EPIC / Sharpley–Williams soil-erodibility term. SoilGrids mapped units are converted to conventional percentages before the calculation.

This K estimate is used as a **relative erodibility input**, not to claim an absolute annual soil-loss rate.

## Erosion screens

Two pathway-specific screens are kept separate.

### Water-erosion susceptibility

Combines:

- local slope from Copernicus DEM
- estimated soil erodibility K
- current vegetation-protection proxy from Sentinel-2 NDVI

The present index is a screening formulation, not a full RUSLE calculation. Rainfall erosivity, slope length, support practices and runoff connectivity are not yet resolved sufficiently for an absolute erosion-rate prediction.

### Aeolian-exposure susceptibility

Combines:

- surface sand/silt/clay composition
- current vegetation-protection proxy
- recent wind-gust context

This is not a replacement for AERO or WEPS and does not calculate horizontal mass flux. It is intended to identify locations where additional loss of protective cover is comparatively risky.

## Grazing decision index

The current v0.2 decision combines four blocks:

- vegetation stress: 38%
- dominant erosion susceptibility: 37%
- recovery-class constraint: 17%
- dry-surface / moisture context: 8%

Hard constraints can override the weighted score, including Recovery Class IV–V and combinations of very high erosion susceptibility with vegetation stress.

Current screening thresholds are:

- **< 0.42:** GRAZE
- **0.42–0.67:** GRAZE CAUTIOUSLY
- **>= 0.67:** DO NOT GRAZE / REST

These thresholds are deliberately published here because they are model assumptions, not established Mongolian management standards. They must be calibrated and revised with field outcome data before operational use.

## Confidence

Confidence is reduced when one or more of the following are unavailable or weak:

- usable current Sentinel-2 observation
- at least three same-season historical observations
- terrain estimate
- SoilGrids soil data
- environmental context
- supplied recovery class

If recovery class is unknown, confidence cannot exceed Moderate in v0.2.

## What is still intentionally not implemented

- livestock carrying capacity or animal-unit-day estimates from NDVI alone
- automatic legal grazing bans
- a recovery-class raster inferred from satellite data
- unvalidated biomass conversions
- absolute RUSLE soil-loss estimates
- AERO/WEPS wind erosion flux estimates without the required surface-state inputs

## Validation priorities before operational use

1. Connect the official spatial recovery-class / ecological-site layer from Mongolia's national monitoring system.
2. Connect authoritative temporary and permanent grazing restrictions.
3. Calibrate Sentinel-2 vegetation metrics to field-measured usable forage by ecological site, season and year.
4. Validate slope and erosion screens against observed erosion, bare-ground and soil-stability measurements.
5. Replace single-pixel vegetation sampling with a robust neighbourhood statistic and quantify spatial uncertainty.
6. Validate GRAZE / CAUTIOUS / REST outcomes retrospectively against NAMEM/GALAGC observations and prospectively with herders and local rangeland specialists.
7. Add herd composition, animal-unit demand, water access and allowable utilization only after forage calibration is defensible.
8. Evaluate whether national or local Mongolian soil maps can improve on the current 250 m global soil layer.
9. Publish validation statistics, confusion matrices, threshold sensitivity and model version for every operational release.

## Status

Version 0.2 is an **experimental grazing recommendation model**. It is designed to make every assumption visible and testable rather than to present an unvalidated score as authoritative management advice.
