export type Locale = "en" | "fr";

export const messages = {
  en: {
    intro: {
      title: "Futuristic developer workstation",
      subtitle: "Click the monitor screen to enter the portfolio desktop.",
      detail:
        "Move your mouse for parallax depth, then click the glowing screen. You will dive into the OS interface.",
      cta: "Click the screen to enter",
      powering: "Powering on…"
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
      title: "Poste de travail développeur",
      subtitle: "Cliquez sur l’écran du moniteur pour accéder au bureau portfolio.",
      detail:
        "Bougez la souris pour le parallaxe, puis cliquez sur l’écran lumineux. Vous entrerez dans l’interface du bureau.",
      cta: "Cliquez sur l’écran pour entrer",
      powering: "Démarrage…"
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
      error: "[ERREUR] Impossible d’envoyer le message. Réessayez plus tard.",
      invalidEmail: "[ERREUR] Format d’e-mail invalide.",
      hint: "Tapez puis Entrée"
    },
    window: { close: "Fermer" }
  }
} as const;

export type MessageTree = (typeof messages)["en"];
