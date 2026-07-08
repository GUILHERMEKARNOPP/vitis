import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { doc, collection, onSnapshot, setDoc, deleteDoc, writeBatch, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import { wines, type Wine } from "@/lib/wines";

export type CartItem = {
  wineId: string;
  quantity: number;
  wine: Wine;
};

type CartContextType = {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (wineId: string, quantity?: number) => Promise<void>;
  removeFromCart: (wineId: string) => Promise<void>;
  updateQuantity: (wineId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync com Firestore ou localStorage
  useEffect(() => {
    if (!user) {
      // Sem usuário: carregar do localStorage
      const local = localStorage.getItem("vitis_cart");
      if (local) {
        try {
          const parsed = JSON.parse(local) as { wineId: string; quantity: number }[];
          const resolved = parsed
            .map((item) => {
              const wine = wines.find((w) => w.id === item.wineId);
              return wine ? { wineId: item.wineId, quantity: item.quantity, wine } : null;
            })
            .filter(Boolean) as CartItem[];
          setCartItems(resolved);
        } catch (e) {
          console.error("Erro ao ler carrinho local:", e);
        }
      } else {
        setCartItems([]);
      }
      setLoading(false);
      return;
    }

    // Com usuário (inclusive anônimo): sincronizar com Firestore
    setLoading(true);
    const cartRef = collection(db, "users", user.uid, "cart");
    
    const unsubscribe = onSnapshot(
      cartRef,
      (snapshot) => {
        const items: CartItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as { quantity: number };
          const wine = wines.find((w) => w.id === docSnap.id);
          if (wine) {
            items.push({
              wineId: docSnap.id,
              quantity: data.quantity,
              wine,
            });
          }
        });
        setCartItems(items);
        setLoading(false);
      },
      (error) => {
        console.warn("Firestore inacessível. Usando fallback para carrinho local:", error);
        // Fallback se as credenciais do Firebase estiverem inválidas/mock
        const local = localStorage.getItem("vitis_cart");
        if (local) {
          try {
            const parsed = JSON.parse(local) as { wineId: string; quantity: number }[];
            const resolved = parsed
              .map((item) => {
                const wine = wines.find((w) => w.id === item.wineId);
                return wine ? { wineId: item.wineId, quantity: item.quantity, wine } : null;
              })
              .filter(Boolean) as CartItem[];
            setCartItems(resolved);
          } catch (e) {
            console.error(e);
          }
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Persistir localmente caso não tenha usuário ou Firestore esteja off
  const persistLocal = (items: CartItem[]) => {
    const raw = items.map((i) => ({ wineId: i.wineId, quantity: i.quantity }));
    localStorage.setItem("vitis_cart", JSON.stringify(raw));
  };

  const addToCart = async (wineId: string, quantity = 1) => {
    const wine = wines.find((w) => w.id === wineId);
    if (!wine) return;

    const existingIndex = cartItems.findIndex((item) => item.wineId === wineId);
    let newItems = [...cartItems];

    if (existingIndex > -1) {
      newItems[existingIndex].quantity += quantity;
    } else {
      newItems.push({ wineId, quantity, wine });
    }

    setCartItems(newItems);
    persistLocal(newItems);

    if (user) {
      try {
        const docRef = doc(db, "users", user.uid, "cart", wineId);
        await setDoc(docRef, { quantity: (existingIndex > -1 ? cartItems[existingIndex].quantity : quantity) }, { merge: true });
      } catch (e) {
        console.error("Erro ao salvar no Firestore:", e);
      }
    }
  };

  const removeFromCart = async (wineId: string) => {
    const newItems = cartItems.filter((item) => item.wineId !== wineId);
    setCartItems(newItems);
    persistLocal(newItems);

    if (user) {
      try {
        const docRef = doc(db, "users", user.uid, "cart", wineId);
        await deleteDoc(docRef);
      } catch (e) {
        console.error("Erro ao deletar no Firestore:", e);
      }
    }
  };

  const updateQuantity = async (wineId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(wineId);
      return;
    }

    const newItems = cartItems.map((item) =>
      item.wineId === wineId ? { ...item, quantity } : item
    );
    setCartItems(newItems);
    persistLocal(newItems);

    if (user) {
      try {
        const docRef = doc(db, "users", user.uid, "cart", wineId);
        await setDoc(docRef, { quantity }, { merge: true });
      } catch (e) {
        console.error("Erro ao atualizar no Firestore:", e);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem("vitis_cart");

    if (user) {
      try {
        const cartRef = collection(db, "users", user.uid, "cart");
        const snapshot = await getDocs(cartRef);
        const batch = writeBatch(db);
        snapshot.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      } catch (e) {
        console.error("Erro ao limpar Firestore:", e);
      }
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.wine.preco * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
