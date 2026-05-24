export type Locale = "en" | "fr";

export const messages = {
  en: {
  intro: {
    title: "Corbiat Florentin's Portfolio",
    subtitle:
      "Click on the monitor screen to access the portfolio desktop.",
    detail:
      "Get ready for a journey into the past of computing.",
    cta: "Click on the screen to enter",
    powering: "Starting up…"
  },

    preview: {
      notFoundTitle: "404 — Page not found",
      notFoundLine1: "The preview could not be loaded on the Internet.",
      notFoundLine2:
        "The site may be offline, blocked, or has no preview image.",
      tryLive: "Try opening the live site →"
    },

    desktop: {
      cvLabel: "CV.pdf",
      contactLabel: "Contact.cmd",
      openLive: "Open live site",
      downloadCv: "Download CV",
      openTab: "Open in new tab"
    },

    pdf: { title: "Curriculum Vitae" },

    contact: {
      title: "Contact Terminal",
      prompt: "C:\\Users\\visitor> contact",
      init: "Initializing contact module...",
      askName: "Enter your name:",
      askEmail: "Enter your email:",
      askMessage: "Enter your message:",
      sending: "Sending message...",
      success: "[SUCCESS] Message successfully sent.",
      error: "[ERROR] Could not send message. Try again later.",
      invalidEmail: "[ERROR] Invalid email format.",
      hint: "Type and press Enter"
    },

    window: { close: "Close" }
  },

  fr: {
    intro: {
      title: "Portfollio de Corbiat Florentin",
      subtitle:
        "Cliquez sur l’écran du moniteur pour accéder au bureau portfolio.",
      detail:
        "Préparez vous à une éxperience dans le passé de l'informatique.",
      cta: "Cliquez sur l’écran pour entrer",
      powering: "Démarrage…"
    },

    preview: {
      notFoundTitle: "404 — Page introuvable",
      notFoundLine1:
        "L’aperçu n’a pas pu être chargé sur Internet.",
      notFoundLine2:
        "Le site est peut-être hors ligne, bloqué, ou sans image d’aperçu.",
      tryLive: "Ouvrir le site en direct →"
    },

    desktop: {
      cvLabel: "CV.pdf",
      contactLabel: "Contact.cmd",
      openLive: "Voir le site",
      downloadCv: "Télécharger le CV",
      openTab: "Ouvrir dans un nouvel onglet"
    },

    pdf: { title: "Curriculum Vitae" },

    contact: {
      title: "Terminal Contact",
      prompt: "C:\\Users\\visitor> contact",
      init: "Initialisation du module contact...",
      askName: "Entrez votre nom :",
      askEmail: "Entrez votre e-mail :",
      askMessage: "Entrez votre message :",
      sending: "Envoi du message...",
      success: "[SUCCÈS] Message envoyé avec succès.",
      error:
        "[ERREUR] Impossible d’envoyer le message. Réessayez plus tard.",
      invalidEmail: "[ERREUR] Format d’e-mail invalide.",
      hint: "Tapez puis Entrée"
    },

    window: { close: "Fermer" }
  }
} as const;

export type MessageTree = (typeof messages)["en"];