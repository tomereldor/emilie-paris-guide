import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;

const LOCAL_KEY = "emilie-paris-v10";

export async function loadData() {
  if (supabase) {
    try {
      const [{ data: people }, { data: recs }] = await Promise.all([
        supabase.from("people").select("*").order("created_at", { ascending: true }),
        supabase.from("recs").select("*").order("created_at", { ascending: true }),
      ]);
      const normalizedRecs = (recs || []).map(r => ({
        ...r,
        desc: r.description ?? r.desc ?? "",
      }));
      const pMap = {};
      (people || []).forEach(p => {
        pMap[p.name] = { note: p.note, photo: p.photo, ts: new Date(p.created_at).getTime() };
      });
      return { people: pMap, recs: normalizedRecs };
    } catch (e) {
      console.error("Supabase load error:", e);
    }
  }
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : { people: {}, recs: [] };
  } catch {
    return { people: {}, recs: [] };
  }
}

export async function saveData(name, note, photo, recsList) {
  if (supabase) {
    try {
      await supabase.from("people").upsert(
        { name, note, photo: photo || null },
        { onConflict: "name" }
      );
      if (recsList.length > 0) {
        const rows = recsList.map(r => ({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          by: name,
          cat: r.cat,
          title: r.title,
          description: r.desc,
          hood: r.hood || null,
          loc: r.loc || null,
          lat: r.lat || null,
          lng: r.lng || null,
          tags: r.tags || [],
          photo: r.photo || null,
        }));
        await supabase.from("recs").insert(rows);
      }
      return;
    } catch (e) {
      console.error("Supabase save error:", e);
    }
  }
  const data = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{"people":{},"recs":[]}');
  data.people[name] = { note, photo: photo || null, ts: Date.now() };
  recsList.forEach(r => {
    data.recs.push({
      ...r,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      by: name,
      ts: Date.now(),
    });
  });
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}
