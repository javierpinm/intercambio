import { cn } from "@/lib/utils";

// TODO Phase 2: Firebase / Firestore Interfaces & Imports
// import { db, auth } from './firebase';
// import { doc, setDoc, getDoc, updateDoc, collection, onSnapshot } from 'firebase/firestore';

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
    status: "en_progreso", // This one matches the seeded in-progress exchange
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
  },
  {
    id: "post-6",
    authorId: "user-6",
    authorName: "Elena Valenzuela",
    authorAvatar: "EV",
    type: "necesito",
    title: "Riego de plantas el próximo fin de semana",
    description: "Me iré de viaje el próximo sábado y domingo. Necesito que alguien de confianza se pase a regar las macetas de mi balcón el domingo por la mañana. Se tarda menos de 10 minutos.",
    category: "jardin",
    suggestedPoints: 2,
    isUrgent: false,
    locationLabel: "La Latina",
    status: "abierto",
    createdAt: "2026-05-22T09:40:00Z",
    interestedUsers: []
  },
  {
    id: "post-7",
    authorId: "user-6",
    authorName: "Elena Valenzuela",
    authorAvatar: "EV",
    type: "ofrezco",
    title: "Retrato ilustrado digital personalizado",
    description: "Dibujo un retrato de perfil en formato digital con estética moderna y alegre a partir de una foto tuya. Ideal para actualizar tu avatar de redes o para hacer un regalo original.",
    category: "arte",
    suggestedPoints: 6,
    isUrgent: false,
    locationLabel: "La Latina",
    status: "abierto",
    createdAt: "2026-05-21T11:00:00Z",
    interestedUsers: []
  },
  {
    id: "post-8",
    authorId: "user-3",
    authorName: "Javier Ortiz",
    authorAvatar: "JO",
    type: "ofrezco",
    title: "Limpieza de malware y optimización de PC",
    description: "Si tu ordenador portátil va sumamente lento o tiene extensiones de navegador molestas, ofrezco revisarlo, eliminar software basura y recomendarte mejoras gratuitas de rendimiento.",
    category: "tecnologia",
    suggestedPoints: 3,
    isUrgent: false,
    locationLabel: "Malasaña",
    status: "abierto",
    createdAt: "2026-05-20T14:15:00Z",
    interestedUsers: []
  },
  {
    id: "post-9",
    authorId: "user-2",
    authorName: "Lucía Gómez",
    authorAvatar: "LG",
    type: "ofrezco",
    title: "Asesoría de poda y siembra en macetuhuertos",
    description: "Comparto mis conocimientos para armar un pequeño huerto en tu balcón o terraza. Te aconsejo qué plantar según la luz de tu casa y cómo podar arbustos urbanos de manera óptima.",
    category: "jardin",
    suggestedPoints: 4,
    isUrgent: false,
    locationLabel: "Lavapiés",
    status: "abierto",
    createdAt: "2026-05-19T10:00:00Z",
    interestedUsers: []
  },
  {
    id: "post-10",
    authorId: "user-1",
    authorName: "Carlos Mendoza",
    authorAvatar: "CM",
    type: "necesito",
    title: "Desmontaje y bajada de estantería de madera",
    description: "Necesito desmontar una estantería grande de pino macizo de mi salón y bajarla al punto limpio móvil del barrio. Se requiere tener un destornillador eléctrico potente y ganas de cargar.",
    category: "mudanzas",
    suggestedPoints: 5,
    isUrgent: false,
    locationLabel: "Chamberí",
    status: "completado", // Matches seeded completed exchange
    createdAt: "2026-05-18T16:00:00Z",
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
    requesterId: "user-5", // Manuel Torres (who needs help)
    helperId: "user-3", // Javier Ortiz (who helps)
    status: "en_progreso",
    requesterConfirmedComplete: false,
    helperConfirmedComplete: false,
    createdAt: "2026-05-24T12:00:00Z",
    updatedAt: "2026-05-24T12:00:00Z"
  },
  {
    id: "exc-2",
    postId: "post-10",
    postTitle: "Desmontaje y bajada de estantería de madera",
    postCategory: "mudanzas",
    postType: "necesito",
    points: 5,
    requesterId: "user-1", // Carlos Mendoza
    helperId: "user-4", // Sofía Ruiz (who helped)
    status: "completado",
    requesterConfirmedComplete: true,
    helperConfirmedComplete: true,
    createdAt: "2026-05-19T09:00:00Z",
    updatedAt: "2026-05-19T11:30:00Z"
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

// Data service layer to isolate mock persistence from future Phase 2 Firestore
export const dataService = {
  init() {
    if (typeof window === "undefined") return;

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

  // --- USER AUTHENTICATION MOCK ---
  // TODO Phase 2: Firebase Authentication (Google popup) + cloud integration
  getCurrentUser(): UserProfile | null {
    if (typeof window === "undefined") return null;
    this.init();
    const currentId = localStorage.getItem(KEYS.CURRENT_USER_ID);
    if (!currentId) return null;

    const users = this.getUsers();
    return users.find(u => u.id === currentId) || null;
  },

  getUsers(): UserProfile[] {
    if (typeof window === "undefined") return MOCK_USERS;
    this.init();
    return JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
  },

  setUsers(users: UserProfile[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  // TODO Phase 2: Guest-to-authenticated user data migration on Google auth login
  loginAsGoogleMock() {
    if (typeof window === "undefined") return null;
    const users = this.getUsers();
    // Choose an existing user or create a persistent "Google" user to simulate realistic signin
    let googleUser = users.find(u => u.id === "google-user-1");
    if (!googleUser) {
      googleUser = {
        id: "google-user-1",
        name: "Javier del Pino (Google)",
        avatar: "JP",
        bio: "Profesor apasionado por la tecnología, los idiomas y dispuesto a compartir e intercambiar saberes en Madrid.",
        skills: ["Docencia", "Matemáticas", "Inglés intermedio", "Hacer pan casero"],
        points: 10, // Starts with 10 points
        favorsDone: 0,
        favorsReceived: 0,
        memberSince: new Date().toISOString(),
        locationLabel: "Malasaña",
      };
      const updated = [...users, googleUser];
      this.setUsers(updated);
    }
    localStorage.setItem(KEYS.CURRENT_USER_ID, googleUser.id);
    return googleUser;
  },

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

  logOut() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(KEYS.CURRENT_USER_ID);
  },

  updateUserProfile(updatedProfile: Partial<UserProfile>) {
    if (typeof window === "undefined") return null;
    const current = this.getCurrentUser();
    if (!current) return null;

    const users = this.getUsers();
    const updatedUsers = users.map(u => {
      if (u.id === current.id) {
        return { ...u, ...updatedProfile };
      }
      return u;
    });

    this.setUsers(updatedUsers);
    return { ...current, ...updatedProfile };
  },

  // --- POSTS ---
  // TODO Phase 2: Firestore — posts collection with real-time updates (onSnapshot)
  getPosts(): Post[] {
    if (typeof window === "undefined") return MOCK_POSTS;
    this.init();
    return JSON.parse(localStorage.getItem(KEYS.POSTS) || "[]");
  },

  setPosts(posts: Post[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
  },

  createPost(postData: Omit<Post, "id" | "authorId" | "authorName" | "authorAvatar" | "status" | "createdAt" | "interestedUsers">) {
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
    return newPost;
  },

  // --- EXCHANGES HANDLERS ---
  // State machine: pendiente → aceptado → en_progreso → completado | cancelado
  // TODO Phase 2: Firestore exchanges collection and security rules
  getExchanges(): Exchange[] {
    if (typeof window === "undefined") return MOCK_EXCHANGES;
    this.init();
    return JSON.parse(localStorage.getItem(KEYS.EXCHANGES) || "[]");
  },

  setExchanges(exchanges: Exchange[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.EXCHANGES, JSON.stringify(exchanges));
  },

  /**
   * User clicks "Ofrecer ayuda" or "Solicitar favor" on a post.
   */
  initiateExchange(postId: string): Exchange | null {
    if (typeof window === "undefined") return null;
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const posts = this.getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return null;
    const post = posts[postIndex];

    if (post.authorId === currentUser.id) {
      // Cannot exchange with oneself
      return null;
    }

    // Determine requester and helper
    // If post type is "ofrezco": post author is the helper, current user is requester
    // If post type is "necesito": post author is the requester, current user is helper
    const helperId = post.type === "ofrezco" ? post.authorId : currentUser.id;
    const requesterId = post.type === "ofrezco" ? currentUser.id : post.authorId;

    // Check if exchange already exists for this post with this requester-helper pair
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

    // Save exchange
    this.setExchanges([newExchange, ...exchanges]);

    // Update post interested users list
    post.interestedUsers = Array.from(new Set([...post.interestedUsers, currentUser.id]));
    this.setPosts(posts);

    // Create Notification to the Post Author
    this.createNotification({
      userId: post.authorId,
      type: "new_request",
      title: "Nueva propuesta de intercambio",
      message: `${currentUser.name} quiere realizar el intercambio de: "${post.title}".`,
      relatedExchangeId: newExchange.id,
      relatedPostId: post.id
    });

    return newExchange;
  },

  /**
   * Post author approves/accepts the pending exchange proposal.
   */
  acceptExchange(exchangeId: string): Exchange | null {
    if (typeof window === "undefined") return null;
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const exchanges = this.getExchanges();
    const idx = exchanges.findIndex(e => e.id === exchangeId);
    if (idx === -1) return null;
    const exchange = exchanges[idx];

    // Verify current user is actually the post author/owner of exchange
    const posts = this.getPosts();
    const post = posts.find(p => p.id === exchange.postId);
    if (!post || post.authorId !== currentUser.id) {
      return null;
    }

    // Change status to aceptado and en_progreso
    exchange.status = "en_progreso";
    exchange.updatedAt = new Date().toISOString();
    exchanges[idx] = exchange;
    this.setExchanges(exchanges);

    // Update post status to locked in_progreso
    post.status = "en_progreso";
    this.setPosts(posts);

    // Notify the helper/requester counterpart
    const counterPartyId = exchange.helperId === currentUser.id ? exchange.requesterId : exchange.helperId;
    this.createNotification({
      userId: counterPartyId,
      type: "accepted",
      title: "Intercambio aceptado",
      message: `¡Buenas noticias! ${currentUser.name} ha aceptado comenzar el intercambio para "${exchange.postTitle}". Ya podéis coordinar los detalles.`,
      relatedExchangeId: exchange.id,
      relatedPostId: post.id
    });

    return exchange;
  },

  /**
   * Dual confirmation completion logic.
   * Points transfer ONLY when both parties confirm. No negative balances allowed.
   */
  completeExchange(exchangeId: string): Exchange | null {
    if (typeof window === "undefined") return null;
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const exchanges = this.getExchanges();
    const idx = exchanges.findIndex(e => e.id === exchangeId);
    if (idx === -1) return null;
    const exchange = exchanges[idx];

    if (exchange.status !== "en_progreso") return exchange;

    // Check who is confirming
    if (exchange.requesterId === currentUser.id) {
      exchange.requesterConfirmedComplete = true;
    } else if (exchange.helperId === currentUser.id) {
      exchange.helperConfirmedComplete = true;
    } else {
      // Forbidden: current user not in exchange
      return null;
    }

    exchange.updatedAt = new Date().toISOString();

    // Check if both parties confirmed
    if (exchange.requesterConfirmedComplete && exchange.helperConfirmedComplete) {
      // DUAL CONFIRMATION MET! Let's handle points transfer and count stats.
      // TODO Phase 2: Cloud Functions atomic point transaction + db triggers.
      
      const users = this.getUsers();
      const requesterIndex = users.findIndex(u => u.id === exchange.requesterId);
      const helperIndex = users.findIndex(u => u.id === exchange.helperId);

      if (requesterIndex !== -1 && helperIndex !== -1) {
        const requester = users[requesterIndex];
        const helper = users[helperIndex];

        // Ensure requester has enough points. If not, we have to handle it:
        // Enforce the strictly positive/non-negative constraint: "Points are non-negative integers — NEVER allow points to go below 0"
        if (requester.points < exchange.points) {
          // In a real DB, transaction aborts. In mock, we can clamp or return an error/warning.
          // Let's prevent completing if it would cause requester's points to go negative, 
          // but if they had enough when the deal was agreed, let's process safely or show a notification.
          // We will strictly deduct and clamp to 0 if force-deducted, but let's deduct up to the max points,
          // OR better: block transfer and throw an error or handle cleanly. Let's make sure it clamps to at least 0.
          // Since the prompt specifies points cannot go below 0, let's ensure requester points = Math.max(0, requester.points - exchange.points);
          // And helper receives whatever is deducted.
          const actualDeduction = Math.min(requester.points, exchange.points);
          requester.points -= actualDeduction;
          helper.points += actualDeduction;
        } else {
          requester.points -= exchange.points;
          helper.points += exchange.points;
        }

        // Increment stats
        helper.favorsDone += 1;
        requester.favorsReceived += 1;

        users[requesterIndex] = requester;
        users[helperIndex] = helper;
        this.setUsers(users);
      }

      // Mark exchange as fully completed
      exchange.status = "completado";

      // Mark the original post status as completado
      const posts = this.getPosts();
      const postIndex = posts.findIndex(p => p.id === exchange.postId);
      if (postIndex !== -1) {
        posts[postIndex].status = "completado";
        this.setPosts(posts);
      }

      // Generate notifications for both
      this.createNotification({
        userId: exchange.requesterId,
        type: "completed",
        title: "Intercambio completado",
        message: `¡Listo! Has confirmado la finalización de gratis/puntos para: "${exchange.postTitle}". Se han transferido ${exchange.points} puntos.`,
        relatedExchangeId: exchange.id,
        relatedPostId: exchange.postId
      });

      this.createNotification({
        userId: exchange.helperId,
        type: "completed",
        title: "Intercambio completado",
        message: `¡Listo! Has completado el favor de "${exchange.postTitle}" y has sumado ${exchange.points} puntos a tu cuenta.`,
        relatedExchangeId: exchange.id,
        relatedPostId: exchange.postId
      });

    } else {
      // Only one confirmed, generate notification for the other party
      const counterPartyId = exchange.helperId === currentUser.id ? exchange.requesterId : exchange.helperId;
      this.createNotification({
        userId: counterPartyId,
        type: "new_favor_pending",
        title: "Confirmación de finalización pendiente",
        message: `${currentUser.name} ha marcado el intercambio para "${exchange.postTitle}" como completado. Confirma tú también para liberar los puntos.`,
        relatedExchangeId: exchange.id,
        relatedPostId: exchange.postId
      });
    }

    exchanges[idx] = exchange;
    this.setExchanges(exchanges);
    return exchange;
  },

  cancelExchange(exchangeId: string): Exchange | null {
    if (typeof window === "undefined") return null;
    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const exchanges = this.getExchanges();
    const idx = exchanges.findIndex(e => e.id === exchangeId);
    if (idx === -1) return null;
    const exchange = exchanges[idx];

    // Verify authorized party: requester or helper
    if (exchange.requesterId !== currentUser.id && exchange.helperId !== currentUser.id) {
      return null;
    }

    exchange.status = "cancelado";
    exchange.updatedAt = new Date().toISOString();
    exchanges[idx] = exchange;
    this.setExchanges(exchanges);

    // Free the post back to abierto
    const posts = this.getPosts();
    const postIndex = posts.findIndex(p => p.id === exchange.postId);
    if (postIndex !== -1) {
      posts[postIndex].status = "abierto";
      this.setPosts(posts);
    }

    // Notify counterparty
    const counterPartyId = exchange.helperId === currentUser.id ? exchange.requesterId : exchange.helperId;
    this.createNotification({
      userId: counterPartyId,
      type: "completed",
      title: "Intercambio cancelado",
      message: `${currentUser.name} ha cancelado la solicitud o el intercambio de "${exchange.postTitle}".`,
      relatedExchangeId: exchange.id,
      relatedPostId: exchange.postId
    });

    return exchange;
  },

  // --- NOTIFICATIONS ---
  // TODO Phase 2: Firebase Cloud Messaging or Firestore triggers on new document
  getNotifications(): AppNotification[] {
    if (typeof window === "undefined") return [];
    this.init();
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

  createNotification(notifData: Omit<AppNotification, "id" | "createdAt" | "read">) {
    if (typeof window === "undefined") return null;

    const newNotif: AppNotification = {
      ...notifData,
      id: "notif-" + Date.now() + Math.floor(Math.random() * 100),
      createdAt: new Date().toISOString(),
      read: false
    };

    const notifs = this.getNotifications();
    this.setNotifications([newNotif, ...notifs]);
    return newNotif;
  },

  markNotificationsAsRead() {
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
  }
};
