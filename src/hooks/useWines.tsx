import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { wines as staticWines, type Wine } from "@/lib/wines";

export function useWines() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const winesRef = collection(db, "wines");

    const unsubscribe = onSnapshot(
      winesRef,
      (snapshot) => {
        const list: Wine[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Wine);
        });

        // Se o banco estiver vazio, usa a base estática para exibição imediata
        if (list.length === 0) {
          setWines(staticWines);
        } else {
          setWines(list);
        }
        setLoading(false);
      },
      (error) => {
        console.warn("Firestore wines collection offline/inaccessible, falling back to static wines:", error);
        setWines(staticWines);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addWine = async (wine: Wine) => {
    try {
      const docRef = doc(db, "wines", wine.id);
      await setDoc(docRef, wine);
    } catch (e) {
      console.error("Erro ao cadastrar vinho no Firestore:", e);
      throw e;
    }
  };

  const updateWine = async (id: string, data: Partial<Wine>) => {
    try {
      const docRef = doc(db, "wines", id);
      await updateDoc(docRef, data);
    } catch (e) {
      console.error("Erro ao atualizar vinho no Firestore:", e);
      throw e;
    }
  };

  const deleteWine = async (id: string) => {
    try {
      const docRef = doc(db, "wines", id);
      await deleteDoc(docRef);
    } catch (e) {
      console.error("Erro ao deletar vinho no Firestore:", e);
      throw e;
    }
  };

  const seedFirestore = async () => {
    try {
      const batch = writeBatch(db);
      staticWines.forEach((wine) => {
        const docRef = doc(db, "wines", wine.id);
        batch.set(docRef, wine, { merge: true });
      });
      await batch.commit();
    } catch (e) {
      console.error("Erro ao popular banco de dados:", e);
      throw e;
    }
  };

  return {
    wines,
    loading,
    addWine,
    updateWine,
    deleteWine,
    seedFirestore,
  };
}
