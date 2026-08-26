/* DustWatch map-only visual layer: warm hotspots, blue pathways, no map text labels. */
window.addPathwayLayers = function(p, selected=false){
  const existing=pathwayLayers.get(key(p.x));
  if(existing){existing.forEach(l=>map.removeLayer(l));pathwayLayers.delete(key(p.x));}
  const layers=[];

  /* Broad transport corridor */
  const corridor=L.polyline(p.centers,{
    color:'#5f8fb7',
    weight:selected?26:19,
    opacity:selected?.30:.20,
    lineCap:'round',
    lineJoin:'round',
    interactive:true
  }).addTo(map);

  /* Crisp pathway centreline */
  const centre=L.polyline(p.centers,{
    color:'#2f628d',
    weight:selected?6.5:4.5,
    opacity:selected?.96:.80,
    lineCap:'round',
    lineJoin:'round',
    interactive:true
  }).addTo(map);
  layers.push(corridor,centre);

  /* Surface and 850 hPa tracks only for the selected event */
  if(selected){
    layers.push(
      L.polyline(p.surfaceTrack,{color:'#93b2cb',weight:1.5,opacity:.72,dashArray:'3 7',interactive:false}).addTo(map),
      L.polyline(p.aloftTrack,{color:'#7398b8',weight:1.5,opacity:.72,dashArray:'8 6',interactive:false}).addTo(map)
    );
  }

  /* Source-favourable parts of the same pathway: darker blue, never hotspot orange/red */
  for(const s of p.sourceSamples){
    const idx=p.samples.indexOf(s)+1;
    const seg=[p.centers[idx-1],p.centers[idx]];
    const glow=L.polyline(seg,{
      color:'#224d72',
      weight:selected?15:11,
      opacity:selected?.28:.20,
      lineCap:'round',
      interactive:false
    }).addTo(map);
    const core=L.polyline(seg,{
      color:'#163d60',
      weight:selected?8:6.5,
      opacity:selected?.98:.88,
      lineCap:'round',
      interactive:false
    }).addTo(map);
    layers.push(glow,core);
  }

  /* Unlabelled upstream terminus */
  const end=p.samples[p.samples.length-1];
  if(end){
    const endIcon=L.divIcon({className:'',html:'<div class="path-end path-end-blue"></div>',iconSize:[10,10],iconAnchor:[5,5]});
    layers.push(L.marker([end.lat,end.lon],{icon:endIcon,interactive:false,zIndexOffset:250}).addTo(map));
  }

  centre.on('click',()=>select(p.x,true));
  corridor.on('click',()=>select(p.x,true));
  pathwayLayers.set(key(p.x),layers);
};
