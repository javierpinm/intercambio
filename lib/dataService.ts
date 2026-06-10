import { cn } from "@/lib/utils";
import { db, auth } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  getDocFromServer
} from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// --- INTERFACES ---
export interface UserProfile {
  id: string;
  name: string;
  avatar: string; // URL or initials
  bio: string;
  skills: string[];
  points: number;
  favorsDone: number;
  favorsReceived: number;
  memberSince: string;
  locationLabel: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  type: "ofrezco" | "necesito";
  title: string;
  description: string;
  category: "reparaciones" | "jardin" | "tecnologia" | "mascotas" | "mudanzas" | "arte" | "otro";
  suggestedPoints: number;
  isUrgent: boolean;
  locationLabel: string; // neighborhood level
  status: "abierto" | "en_progreso" | "completado" | "cancelado";
  createdAt: string;
  interestedUsers: string[];
}

export interface Exchange {
  id: string;
  postId: string;
  postTitle: string;
  postCategory: string;
  postType: "ofrezco" | "necesito";
  points: number;
  requesterId: string; // person receiving help
  helperId: string; // person offering help
  status: "pendiente" | "aceptado" | "en_progreso" | "completado" | "cancelado";
  requesterConfirmedComplete: boolean;
  helperConfirmedComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: "new_request" | "accepted" | "completed" | "new_favor_pending";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  relatedExchangeId?: string;
  relatedPostId?: string;
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// --- STANDARD ERROR HANDLER ---
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Coordinate mappings for the simulated neighborhood map
export const NEIGHBORHOOD_COORDS: Record<string, { x: number; y: number }> = {
  "Chamberí": { x: 30, y: 25 },
  "Malasaña": { x: 45, y: 40 },
  "Chueca": { x: 65, y: 35 },
  "Retiro": { x: 80, y: 65 },
  "Lavapiés": { x: 45, y: 80 },
  "La Latina": { x: 25, y: 70 },
};

// Seed Mock Users
const MOCK_USERS: UserProfile[] = [
  {
    id: "user-1",
    name: "Carlos Mendoza",
    avatar: "CM",
    bio: "Manitas aficionado. Me encanta arreglar cosas en casa, armar muebles y echar una mano en lo que sea.",
    skills: ["Carpintería", "Montaje de muebles", "Electricidad básica"],
    points: 12,
    favorsDone: 5,
    favorsReceived: 3,
    memberSince: "2026-01-15T10:00:00Z",
    locationLabel: "Chamberí",
  },
  {
    id: "user-2",
    name: "Lucía Gómez",
    avatar: "LG",
    bio: "Amante de la naturaleza, las plantas y los perros. Tengo bastante tiempo libre los fines de semana.",
    skills: ["Jardinería", "Paseo de perros", "Cuidado de gatos"],
    points: 8,
    favorsDone: 2,
    favorsReceived: 4,
    memberSince: "2026-02-10T14:30:00Z",
    locationLabel: "Lavapiés",
  },
  {
    id: "user-3",
    name: "Javier Ortiz",
    avatar: "JO",
    bio: "Ingeniero de software en constante aprendizaje. Te ayudo con problemas informáticos, software y configuración móvil.",
    skills: ["Informática", "WordPress", "Configuración de redes"],
    points: 15,
    favorsDone: 9,
    favorsReceived: 2,
    memberSince: "2026-03-01T08:15:00Z",
    locationLabel: "Malasaña",
  },
  {
    id: "user-4",
    name: "Sofía Ruiz",
    avatar: "SR",
    bio: "Diseñadora gráfica y pastelera amateur. Siempre lista para intercambiar creatividad y rellenar tardes con arte.",
    skills: ["Diseño de logos", "Ilustración digital", "Pastelería casera"],
    points: 10,
    favorsDone: 4,
    favorsReceived: 4,
    memberSince: "2025-11-20T11:45:00Z",
    locationLabel: "Retiro",
  },
  {
    id: "user-5",
    name: "Manuel Torres",
    avatar: "MT",
    bio: "Estudiante de idiomas. Ofrezco clases particulares de inglés y francés, y ayuda con traducciones de textos.",
    skills: ["Idiomas (Inglés)", "Francés", "Traducción de textos"],
    points: 7,
    favorsDone: 1,
    favorsReceived: 3,
    memberSince: "2026-04-12T17:20:00Z",
    locationLabel: "Chueca",
  },
  {
    id: "user-6",
    name: "Elena Valenzuela",
    avatar: "EV",
    bio: "Apasionada del bricolaje, arte urbano y los idiomas. Dispuesta a compartir experiencias en Madrid central.",
    skills: ["Decoración", "Pintura mural", "Italiano básico"],
    points: 11,
    favorsDone: 3,
    favorsReceived: 2,
    memberSince: "2026-02-18T09:10:00Z",
    locationLabel: "La Latina",
  }
];

// Seed Mock Posts
const MOCK_POSTS: Post[] = [
  {
    id: "post-1",
    authorId: "user-2",
    authorName: "Lucía Gómez",
    authorAvatar: "LG",
    type: "necesito",
    title: "Pasear a mi perro Toby esta tarde",
    description: "Busco a alguien responsable que pueda pasear a mi golden retriever, Toby, esta tarde por las calles de Lavapiés. Es urgente porque tengo una videoconferencia imprevista muy larga.",
    category: "mascotas",
    suggestedPoints: 3,
    isUrgent: true,
    locationLabel: "Lavapiés",
    status: "abierto",
    createdAt: "2026-05-25T07:15:00Z",
    interestedUsers: []
  },
  {
    id: "post-2",
    authorId: "user-1",
    authorName: "Carlos Mendoza",
    authorAvatar: "CM",
    type: "ofrezco",
    title: "Clases de iniciación de guitarra española",
    description: "Ofrezco clases básicas de guitarra española para principiantes. Llevo tocando más de 10 años. Te enseño acordes fundamentales y ritmos básicos para arrancar. ¡Podemos hacer la sesión al aire libre en un parque!",
    category: "arte",
    suggestedPoints: 5,
    isUrgent: false,
    locationLabel: "Chamberí",
    status: "abierto",
    createdAt: "2026-05-24T18:00:00Z",
    interestedUsers: []
  },
  {
    id: "post-3",
    authorId: "user-5",
    authorName: "Manuel Torres",
    authorAvatar: "MT",
    type: "necesito",
    title: "Cambiar junta de grifo de cocina que gotea",
    description: "Mi grifo de la cocina gotea constantemente y está desgastando la madera alrededor. He comprado la junta de recambio pero carezco de las herramientas y no sé cómo cerrar la llave de paso correctamente.",
    category: "reparaciones",
    suggestedPoints: 4,
    isUrgent: false,
    locationLabel: "Chueca",
    status: "en_progreso",
    createdAt: "2026-05-24T10:30:00Z",
    interestedUsers: ["user-3"]
  },
  {
    id: "post-4",
    authorId: "user-4",
    authorName: "Sofía Ruiz",
    authorAvatar: "SR",
    type: "necesito",
    title: "Ayuda urgente para cargar tres sofás pequeños",
    description: "Alquilé un furgón para hoy lunes. Necesito dos brazos fuertes adicionales para bajar tres sofás medianos desde un tercer piso sin ascensor hasta el furgón. Son menos de 45 minutos de esfuerzo.",
    category: "mudanzas",
    suggestedPoints: 8,
    isUrgent: true,
    locationLabel: "Retiro",
    status: "abierto",
    createdAt: "2026-05-25T06:00:00Z",
    interestedUsers: []
  },
  {
    id: "post-5",
    authorId: "user-3",
    authorName: "Javier Ortiz",
    authorAvatar: "JO",
    type: "ofrezco",
    title: "Asesoría técnica para WordPress o React",
    description: "Ofrezco dos horas de consultoría técnica para ayudarte a configurar el entorno de desarrollo para tu nuevo proyecto, tu blog con WordPress, poner a punto tu dominio o resolver dudas técnicas sobre programación.",
    category: "tecnologia",
    suggestedPoints: 7,
    isUrgent: false,
    locationLabel: "Malasaña",
    status: "abierto",
    createdAt: "2026-05-23T15:20:00Z",
    interestedUsers: []
  }
];

// Seed Mock Exchanges
const MOCK_EXCHANGES: Exchange[] = [
  {
    id: "exc-1",
    postId: "post-3",
    postTitle: "Cambiar junta de grifo de cocina que gotea",
    postCategory: "reparaciones",
    postType: "necesito",
    points: 4,
    requesterId: "user-5",
    helperId: "user-3",
    status: "en_progreso",
    requesterConfirmedComplete: false,
    helperConfirmedComplete: false,
    createdAt: "2026-05-24T12:00:00Z",
    updatedAt: "2026-05-24T12:00:00Z"
  }
];

// LocalStorage Keys
const KEYS = {
  USERS: "intercambio_users",
  POSTS: "intercambio_posts",
  EXCHANGES: "intercambio_exchanges",
  NOTIFICATIONS: "intercambio_notifications",
  CURRENT_USER_ID: "intercambio_current_user_id",
  THEME: "intercambio_theme",
};

// Data service layer to isolate mock persistence and support Firebase
export const dataService = {
  async init() {
    if (typeof window === "undefined") return;

    // LocalStorage Fallback Seeding
    if (!localStorage.getItem(KEYS.USERS)) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(MOCK_USERS));
    }
    if (!localStorage.getItem(KEYS.POSTS)) {
      localStorage.setItem(KEYS.POSTS, JSON.stringify(MOCK_POSTS));
    }
    if (!localStorage.getItem(KEYS.EXCHANGES)) {
      localStorage.setItem(KEYS.EXCHANGES, JSON.stringify(MOCK_EXCHANGES));
    }
    if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
      const defaultNotifs: AppNotification[] = [
        {
          id: "notif-1",
          userId: "user-5",
          type: "new_request",
          title: "Nueva solicitud de intercambio",
          message: "Javier Ortiz se ha ofrecido para ayudarte con 'Cambiar junta de grifo de cocina que gotea'.",
          createdAt: "2026-05-24T11:45:00Z",
          read: false,
          relatedExchangeId: "exc-1",
          relatedPostId: "post-3"
        }
      ];
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(defaultNotifs));
    }

    // MANDATORY CONSTRAINT: test the Firestore connection on boot
    try {
      await getDocFromServer(doc(db, "test", "connection"));
    } catch (error) {
      if (error instanceof Error && error.message.includes("the client is offline")) {
        console.error("Please check your Firebase configuration.");
      }
    }
  },

  // --- DATABASE SEEDING FOR CLOUD ---
  async seedFirestoreIfEmpty() {
    if (typeof window === "undefined" || !auth.currentUser) return;
    try {
      const postsSnap = await getDocs(collection(db, "posts"));
      if (postsSnap.empty) {
        console.log("Seeding empty cloud Firestore database with default records...");
        
        // Seed default users
        for (const user of MOCK_USERS) {
          await setDoc(doc(db, "users", user.id), user);
        }
        // Seed default posts
        for (const post of MOCK_POSTS) {
          await setDoc(doc(db, "posts", post.id), post);
        }
        // Seed default exchanges
        for (const exchange of MOCK_EXCHANGES) {
          await setDoc(doc(db, "exchanges", exchange.id), exchange);
        }
        // Seed notifications
        const defaultNotifs: AppNotification[] = [
          {
            id: "notif-1",
            userId: "user-5",
            type: "new_request",
            title: "Nueva solicitud de intercambio",
            message: "Javier Ortiz se ha ofrecido para ayudarte con 'Cambiar junta de grifo de cocina que gotea'.",
            createdAt: "2026-05-24T11:45:00Z",
            read: false,
            relatedExchangeId: "exc-1",
            relatedPostId: "post-3"
          }
        ];
        for (const notif of defaultNotifs) {
          await setDoc(doc(db, "notifications", notif.id), notif);
        }
      }
    } catch (e) {
      console.error("Failed to seed empty Firestore: ", e);
    }
  },

  // --- THEME MANAGEMENT ---
  getStoredTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem(KEYS.THEME) as "light" | "dark") || "light";
  },

  setStoredTheme(theme: "light" | "dark") {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.THEME, theme);
  },

  // --- USER PROFILE & AUTH ---
  getCurrentUser(): UserProfile | null {
    if (typeof window === "undefined") return null;
    const currentId = localStorage.getItem(KEYS.CURRENT_USER_ID);
    if (!currentId) return null;

    const users = this.getUsers();
    return users.find(u => u.id === currentId) || null;
  },

  getUsers(): UserProfile[] {
    if (typeof window === "undefined") return MOCK_USERS;
    return JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
  },

  setUsers(users: UserProfile[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  // --- REAL GOOGLE SIGN IN via POPUP ---
  async loginWithGoogle(): Promise<UserProfile | null> {
    if (typeof window === "undefined") return null;
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      const profile = await this.syncUserProfile(firebaseUser);
      if (profile) {
        // Seed if first time
        await this.seedFirestoreIfEmpty();
      }
      return profile;
    } catch (error) {
      console.error("Auth error during Google sign-in: ", error);
      throw error;
    }
  },

  // Fallback Google Mock to assure zero layout breaks
  loginAsGoogleMock() {
    return this.loginAsGuest(); // Redirect fallback to guest for simplicity
  },

  // --- GUEST LOG IN ---
  loginAsGuest() {
    if (typeof window === "undefined") return null;
    const users = this.getUsers();
    
    // Check if there is already a guest user registered in localStorage
    const storedGuestId = localStorage.getItem("intercambio_last_guest_id");
    let guestUser = storedGuestId ? users.find(u => u.id === storedGuestId) : null;
    
    if (!guestUser) {
      const guestId = "guest-" + Math.floor(100000 + Math.random() * 900000);
      guestUser = {
        id: guestId,
        name: "Invitado " + guestId.split("-")[1],
        avatar: "👥",
        bio: "Perfil de invitado. ¡Puedes editar tu información y empezar a acumular puntos ayudando a tus vecinos!",
        skills: ["Ayuda general", "Compañía", "Recados"],
        points: 10, // 10 points welcome bonus as specified
        favorsDone: 0,
        favorsReceived: 0,
        memberSince: new Date().toISOString(),
        locationLabel: "Chamberí",
      };
      
      const updated = [...users, guestUser];
      this.setUsers(updated);
      localStorage.setItem("intercambio_last_guest_id", guestId);
    }
    
    localStorage.setItem(KEYS.CURRENT_USER_ID, guestUser.id);
    return guestUser;
  },

  loginAsUserProfile(userId: string): UserProfile | null {
    if (typeof window === "undefined") return null;
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return null;
    localStorage.setItem(KEYS.CURRENT_USER_ID, user.id);
    return user;
  },

  async logOut() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(KEYS.CURRENT_USER_ID);
    await auth.signOut();
  },

  async syncUserProfile(firebaseUser: any): Promise<UserProfile | null> {
    if (typeof window === "undefined") return null;
    const userDocRef = doc(db, "users", firebaseUser.uid);
    let profile: UserProfile | null = null;
    
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        profile = userDoc.data() as UserProfile;
      } else {
        // Create new user profile in Firestore
        const name = firebaseUser.displayName || "Vecino de Madrid";
        const words = name.trim().split(/\s+/);
        const avatar = words.length >= 2 
          ? (words[0][0] + words[1][0]).toUpperCase() 
          : name.slice(0, 2).toUpperCase();
          
        profile = {
          id: firebaseUser.uid,
          name: name,
          avatar: avatar || "V",
          bio: "¡Hola! Estoy muy feliz de unirme a la red solidaria del barrio. Ofrezco mi tiempo y mis habilidades para ayudarnos en la comunidad.",
          skills: ["Ayuda general", "Recados", "Conversación"],
          points: 10, // 10 points starting bonus
          favorsDone: 0,
          favorsReceived: 0,
          memberSince: new Date().toISOString(),
          locationLabel: "Chamberí",
        };
        await setDoc(userDocRef, profile);
      }
      
      // Save locally to cache/localstorage for instant retrieval
      localStorage.setItem(KEYS.CURRENT_USER_ID, profile.id);
      const users = this.getUsers();
      const otherUsers = users.filter(u => u.id !== profile!.id);
      this.setUsers([...otherUsers, profile]);
      return profile;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
      return null;
    }
  },

  async updateUserProfile(updatedProfile: Partial<UserProfile>) {
    if (typeof window === "undefined") return null;
    const current = this.getCurrentUser();
    if (!current) return null;

    const updated = { ...current, ...updatedProfile };
    
    // Save to local cache
    const users = this.getUsers();
    const updatedUsers = users.map(u => (u.id === current.id ? updated : u));
    this.setUsers(updatedUsers);

    // Save to Firestore if authenticated
    if (auth.currentUser && current.id === auth.currentUser.uid) {
      try {
        await setDoc(doc(db, "users", current.id), updated);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${current.id}`);
      }
    }

    return updated;
  },

  // --- POSTS ---
  getPosts(): Post[] {
    if (typeof window === "undefined") return MOCK_POSTS;
    return JSON.parse(localStorage.getItem(KEYS.POSTS) || "[]");
  },

  setPosts(posts: Post[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
  },

  async createPost(postData: Omit<Post, "id" | "authorId" | "authorName" | "authorAvatar" | "status" | "createdAt" | "interestedUsers">) {
    if (typeof window === "undefined") return null;
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const newPost: Post = {
      ...postData,
      id: "post-" + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      status: "abierto",
      createdAt: new Date().toISOString(),
      interestedUsers: []
    };

    const posts = this.getPosts();
    this.setPosts([newPost, ...posts]);

    // Save to Firestore if authenticated
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, "posts", newPost.id), newPost);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `posts/${newPost.id}`);
      }
    }

    return newPost;
  },

  // --- EXCHANGES HANDLERS ---
  getExchanges(): Exchange[] {
    if (typeof window === "undefined") return MOCK_EXCHANGES;
    return JSON.parse(localStorage.getItem(KEYS.EXCHANGES) || "[]");
  },

  setExchanges(exchanges: Exchange[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.EXCHANGES, JSON.stringify(exchanges));
  },

  async initiateExchange(postId: string): Promise<Exchange | null> {
    if (typeof window === "undefined") return null;
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const posts = this.getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return null;
    const post = posts[postIndex];

    if (post.authorId === currentUser.id) {
      return null;
    }

    const helperId = post.type === "ofrezco" ? post.authorId : currentUser.id;
    const requesterId = post.type === "ofrezco" ? currentUser.id : post.authorId;

    const exchanges = this.getExchanges();
    const existing = exchanges.find(e => e.postId === postId && e.requesterId === requesterId && e.helperId === helperId && e.status !== "cancelado");
    if (existing) return existing;

    const newExchange: Exchange = {
      id: "exc-" + Date.now(),
      postId: post.id,
      postTitle: post.title,
      postCategory: post.category,
      postType: post.type,
      points: post.suggestedPoints,
      requesterId,
      helperId,
      status: "pendiente",
      requesterConfirmedComplete: false,
      helperConfirmedComplete: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.setExchanges([newExchange, ...exchanges]);

    post.interestedUsers = Array.from(new Set([...post.interestedUsers, currentUser.id]));
    this.setPosts(posts);

    // Create Notification
    const newNotif = await this.createNotification({
      userId: post.authorId,
      type: "new_request",
      title: "Nueva propuesta de intercambio",
      message: `${currentUser.name} quiere realizar el intercambio de: "${post.title}".`,
      relatedExchangeId: newExchange.id,
      relatedPostId: post.id
    });

    // Save to Firestore if authenticated
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, "exchanges", newExchange.id), newExchange);
        await setDoc(doc(db, "posts", post.id), post);
        if (newNotif) {
          await setDoc(doc(db, "notifications", newNotif.id), newNotif);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `exchanges/${newExchange.id}`);
      }
    }

    return newExchange;
  },

  async acceptExchange(exchangeId: string): Promise<Exchange | null> {
    if (typeof window === "undefined") return null;
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const exchanges = this.getExchanges();
    const idx = exchanges.findIndex(e => e.id === exchangeId);
    if (idx === -1) return null;
    const exchange = exchanges[idx];

    const posts = this.getPosts();
    const post = posts.find(p => p.id === exchange.postId);
    if (!post || post.authorId !== currentUser.id) {
      return null;
    }

    exchange.status = "en_progreso";
    exchange.updatedAt = new Date().toISOString();
    exchanges[idx] = exchange;
    this.setExchanges(exchanges);

    post.status = "en_progreso";
    this.setPosts(posts);

    const counterPartyId = exchange.helperId === currentUser.id ? exchange.requesterId : exchange.helperId;
    const newNotif = await this.createNotification({
      userId: counterPartyId,
      type: "accepted",
      title: "Intercambio aceptado",
      message: `¡Buenas noticias! ${currentUser.name} ha aceptado comenzar el intercambio para "${exchange.postTitle}". Ya podéis coordinar los detalles.`,
      relatedExchangeId: exchange.id,
      relatedPostId: post.id
    });

    // Save to Firestore if authenticated
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, "exchanges", exchange.id), exchange);
        await setDoc(doc(db, "posts", post.id), post);
        if (newNotif) {
          await setDoc(doc(db, "notifications", newNotif.id), newNotif);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `exchanges/${exchange.id}`);
      }
    }

    return exchange;
  },

  async completeExchange(exchangeId: string): Promise<Exchange | null> {
    if (typeof window === "undefined") return null;
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const exchanges = this.getExchanges();
    const idx = exchanges.findIndex(e => e.id === exchangeId);
    if (idx === -1) return null;
    const exchange = exchanges[idx];

    if (exchange.status !== "en_progreso") return exchange;

    if (exchange.requesterId === currentUser.id) {
      exchange.requesterConfirmedComplete = true;
    } else if (exchange.helperId === currentUser.id) {
      exchange.helperConfirmedComplete = true;
    } else {
      return null;
    }

    exchange.updatedAt = new Date().toISOString();
    let transferTriggered = false;
    let requesterProfile: UserProfile | null = null;
    let helperProfile: UserProfile | null = null;

    if (exchange.requesterConfirmedComplete && exchange.helperConfirmedComplete) {
      transferTriggered = true;
      const users = this.getUsers();
      const requesterIndex = users.findIndex(u => u.id === exchange.requesterId);
      const helperIndex = users.findIndex(u => u.id === exchange.helperId);

      if (requesterIndex !== -1 && helperIndex !== -1) {
        const requester = users[requesterIndex];
        const helper = users[helperIndex];

        if (requester.points < exchange.points) {
          const actualDeduction = Math.min(requester.points, exchange.points);
          requester.points -= actualDeduction;
          helper.points += actualDeduction;
        } else {
          requester.points -= exchange.points;
          helper.points += exchange.points;
        }

        helper.favorsDone += 1;
        requester.favorsReceived += 1;

        requesterProfile = requester;
        helperProfile = helper;

        users[requesterIndex] = requester;
        users[helperIndex] = helper;
        this.setUsers(users);
      }

      exchange.status = "completado";

      const posts = this.getPosts();
      const postIndex = posts.findIndex(p => p.id === exchange.postId);
      if (postIndex !== -1) {
        posts[postIndex].status = "completado";
        this.setPosts(posts);
        
        if (auth.currentUser) {
          try {
            await setDoc(doc(db, "posts", posts[postIndex].id), posts[postIndex]);
          } catch (e) {
            console.error("Firestore error saving completed post: ", e);
          }
        }
      }

      // Create completion notifications
      const notif1 = await this.createNotification({
        userId: exchange.requesterId,
        type: "completed",
        title: "Intercambio completado",
        message: `¡Listo! Has confirmado la finalización del favor para: "${exchange.postTitle}". Se han transferido ${exchange.points} puntos.`,
        relatedExchangeId: exchange.id,
        relatedPostId: exchange.postId
      });

      const notif2 = await this.createNotification({
        userId: exchange.helperId,
        type: "completed",
        title: "Intercambio completado",
        message: `¡Listo! Has completado el favor de "${exchange.postTitle}" y has sumado ${exchange.points} puntos a tu cuenta.`,
        relatedExchangeId: exchange.id,
        relatedPostId: exchange.postId
      });

      if (auth.currentUser) {
        try {
          if (notif1) await setDoc(doc(db, "notifications", notif1.id), notif1);
          if (notif2) await setDoc(doc(db, "notifications", notif2.id), notif2);
        } catch (e) {
          console.error("Firestore notifications error: ", e);
        }
      }

    } else {
      // Pending other party's confirmation notification
      const counterPartyId = exchange.helperId === currentUser.id ? exchange.requesterId : exchange.helperId;
      const termNotif = await this.createNotification({
        userId: counterPartyId,
        type: "new_favor_pending",
        title: "Confirmación de finalización pendiente",
        message: `${currentUser.name} ha marcado el intercambio para "${exchange.postTitle}" como completado. Confirma tú también para liberar los puntos.`,
        relatedExchangeId: exchange.id,
        relatedPostId: exchange.postId
      });

      if (auth.currentUser && termNotif) {
        try {
          await setDoc(doc(db, "notifications", termNotif.id), termNotif);
        } catch (e) {
          console.error("Firestore notification pending error: ", e);
        }
      }
    }

    exchanges[idx] = exchange;
    this.setExchanges(exchanges);

    // Save to Firestore if authenticated
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, "exchanges", exchange.id), exchange);
        if (transferTriggered && requesterProfile && helperProfile) {
          await setDoc(doc(db, "users", requesterProfile.id), requesterProfile);
          await setDoc(doc(db, "users", helperProfile.id), helperProfile);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `exchanges/${exchange.id}`);
      }
    }

    return exchange;
  },

  async cancelExchange(exchangeId: string): Promise<Exchange | null> {
    if (typeof window === "undefined") return null;
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const exchanges = this.getExchanges();
    const idx = exchanges.findIndex(e => e.id === exchangeId);
    if (idx === -1) return null;
    const exchange = exchanges[idx];

    if (exchange.requesterId !== currentUser.id && exchange.helperId !== currentUser.id) {
      return null;
    }

    exchange.status = "cancelado";
    exchange.updatedAt = new Date().toISOString();
    exchanges[idx] = exchange;
    this.setExchanges(exchanges);

    const posts = this.getPosts();
    const postIndex = posts.findIndex(p => p.id === exchange.postId);
    if (postIndex !== -1) {
      posts[postIndex].status = "abierto";
      this.setPosts(posts);
    }

    const counterPartyId = exchange.helperId === currentUser.id ? exchange.requesterId : exchange.helperId;
    const cancelNotif = await this.createNotification({
      userId: counterPartyId,
      type: "completed",
      title: "Intercambio cancelado",
      message: `${currentUser.name} ha cancelado la solicitud o el intercambio de "${exchange.postTitle}".`,
      relatedExchangeId: exchange.id,
      relatedPostId: exchange.postId
    });

    // Save to Firestore if authenticated
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, "exchanges", exchange.id), exchange);
        if (postIndex !== -1) {
          await setDoc(doc(db, "posts", posts[postIndex].id), posts[postIndex]);
        }
        if (cancelNotif) {
          await setDoc(doc(db, "notifications", cancelNotif.id), cancelNotif);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `exchanges/${exchange.id}`);
      }
    }

    return exchange;
  },

  // --- NOTIFICATIONS ---
  getNotifications(): AppNotification[] {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS) || "[]");
  },

  setNotifications(notifications: AppNotification[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  getUserNotifications(): AppNotification[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    return this.getNotifications()
      .filter(n => n.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createNotification(notifData: Omit<AppNotification, "id" | "createdAt" | "read">) {
    if (typeof window === "undefined") return null;

    const newNotif: AppNotification = {
      ...notifData,
      id: "notif-" + Date.now() + Math.floor(Math.random() * 100),
      createdAt: new Date().toISOString(),
      read: false
    };

    const notifs = this.getNotifications();
    this.setNotifications([newNotif, ...notifs]);

    // Save to Firestore if authenticated
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, "notifications", newNotif.id), newNotif);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `notifications/${newNotif.id}`);
      }
    }

    return newNotif;
  },

  async markNotificationsAsRead() {
    if (typeof window === "undefined") return;
    const user = this.getCurrentUser();
    if (!user) return;

    const notifs = this.getNotifications();
    const updated = notifs.map(n => {
      if (n.userId === user.id) {
        return { ...n, read: true };
      }
      return n;
    });
    this.setNotifications(updated);

    // Write updates to Firestore if authenticated
    if (auth.currentUser) {
      try {
        const userNotifs = updated.filter(n => n.userId === user.id);
        for (const notif of userNotifs) {
          await setDoc(doc(db, "notifications", notif.id), notif);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "notificationsRead");
      }
    }
  },

  // --- REAL-TIME LIVE SNAPSHOTS FROM FIRESTORE ---
  setupRealtimeListeners(userId: string, onUpdate: () => void) {
    if (typeof window === "undefined" || !auth.currentUser) return () => {};

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const users: UserProfile[] = [];
      snapshot.forEach(docSnap => {
        users.push(docSnap.data() as UserProfile);
      });
      if (users.length > 0) {
        this.setUsers(users);
        onUpdate();
      }
    }, (error) => {
      console.error("Firestore user sync failed: ", error);
    });

    const unsubPosts = onSnapshot(collection(db, "posts"), (snapshot) => {
      const posts: Post[] = [];
      snapshot.forEach(docSnap => {
        posts.push(docSnap.data() as Post);
      });
      if (posts.length > 0) {
        posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.setPosts(posts);
        onUpdate();
      }
    }, (error) => {
      console.error("Firestore post sync failed: ", error);
    });

    const unsubExchanges = onSnapshot(collection(db, "exchanges"), (snapshot) => {
      const exchanges: Exchange[] = [];
      snapshot.forEach(docSnap => {
        exchanges.push(docSnap.data() as Exchange);
      });
      if (exchanges.length > 0) {
        this.setExchanges(exchanges);
        onUpdate();
      }
    }, (error) => {
      console.error("Firestore exchange sync failed: ", error);
    });

    const unsubNotifs = onSnapshot(collection(db, "notifications"), (snapshot) => {
      const notifs: AppNotification[] = [];
      snapshot.forEach(docSnap => {
        const notif = docSnap.data() as AppNotification;
        if (notif.userId === userId) {
          notifs.push(notif);
        }
      });
      this.setNotifications(notifs);
      onUpdate();
    }, (error) => {
      console.error("Firestore notifications sync failed: ", error);
    });

    return () => {
      unsubUsers();
      unsubPosts();
      unsubExchanges();
      unsubNotifs();
    };
  }
};
