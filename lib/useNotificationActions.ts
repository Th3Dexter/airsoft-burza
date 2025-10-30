'use client'

import { useNotifications } from './NotificationContext'

export function useNotificationActions() {
  const { showSuccess, showError, showWarning, showInfo, showConfirmation } = useNotifications()

  const notifyProfileSaved = () => {
    showSuccess('Profil uložen', 'Vaše změny byly úspěšně uloženy.')
  }

  const notifyProfileError = (error?: string) => {
    showError('Chyba při ukládání', error || 'Nepodařilo se uložit váš profil. Zkuste to prosím znovu.')
  }

  const notifyProductCreated = () => {
    showSuccess('Inzerát vytvořen', 'Váš inzerát byl úspěšně zveřejněn.')
  }

  const notifyProductError = (error?: string) => {
    showError('Chyba při vytváření', error || 'Nepodařilo se vytvořit inzerát. Zkuste to prosím znovu.')
  }

  const notifyProductUpdated = () => {
    showSuccess('Inzerát aktualizován', 'Váš inzerát byl úspěšně upraven.')
  }

  const notifyProductUpdateError = (error?: string) => {
    showError('Chyba při aktualizaci', error || 'Nepodařilo se upravit inzerát. Zkuste to prosím znovu.')
  }

  const confirmDeleteProduct = async (productName?: string): Promise<boolean> => {
    return await showConfirmation({
      title: 'Smazat inzerát',
      message: productName 
        ? `Opravdu si přejete smazat inzerát "${productName}"? Tato akce je nevratná.`
        : 'Opravdu si přejete smazat tento inzerát? Tato akce je nevratná.',
      confirmText: 'Smazat',
      cancelText: 'Zrušit',
      type: 'danger'
    })
  }

  const notifyProductDeleted = () => {
    showSuccess('Inzerát smazán', 'Váš inzerát byl úspěšně smazán.')
  }

  const notifyProductDeleteError = (error?: string) => {
    showError('Chyba při mazání', error || 'Nepodařilo se smazat inzerát. Zkuste to prosím znovu.')
  }

  const notifyMessageSent = () => {
    showSuccess('Zpráva odeslána', 'Vaše zpráva byla úspěšně odeslána.')
  }

  const notifyMessageError = (error?: string) => {
    showError('Chyba při odesílání', error || 'Nepodařilo se odeslat zprávu. Zkuste to prosím znovu.')
  }

  const notifyLoginSuccess = () => {
    showSuccess('Přihlášení úspěšné', 'Vítejte zpět!')
  }

  const notifyLoginError = (error?: string) => {
    showError('Chyba při přihlašování', error || 'Nepodařilo se přihlásit. Zkontrolujte své údaje.')
  }

  const notifyLogoutSuccess = () => {
    showInfo('Odhlášení úspěšné', 'Byli jste úspěšně odhlášeni.')
  }

  const notifyRegistrationSuccess = () => {
    showSuccess('Registrace úspěšná', 'Váš účet byl úspěšně vytvořen. Vítejte!')
  }

  const notifyRegistrationError = (error?: string) => {
    showError('Chyba při registraci', error || 'Nepodařilo se vytvořit účet. Zkuste to prosím znovu.')
  }

  const confirmLogout = async (): Promise<boolean> => {
    return await showConfirmation({
      title: 'Odhlásit se',
      message: 'Opravdu si přejete se odhlásit?',
      confirmText: 'Odhlásit',
      cancelText: 'Zrušit',
      type: 'warning'
    })
  }

  const notifySearchError = (error?: string) => {
    showError('Chyba při vyhledávání', error || 'Nepodařilo se provést vyhledávání. Zkuste to prosím znovu.')
  }

  const notifyNoResults = () => {
    showInfo('Žádné výsledky', 'Nebyly nalezeny žádné produkty odpovídající vašemu vyhledávání.')
  }

  return {
    // Profil
    notifyProfileSaved,
    notifyProfileError,
    
    // Produkty
    notifyProductCreated,
    notifyProductError,
    notifyProductUpdated,
    notifyProductUpdateError,
    confirmDeleteProduct,
    notifyProductDeleted,
    notifyProductDeleteError,
    
    // Zprávy
    notifyMessageSent,
    notifyMessageError,
    
    // Autentizace
    notifyLoginSuccess,
    notifyLoginError,
    notifyLogoutSuccess,
    notifyRegistrationSuccess,
    notifyRegistrationError,
    confirmLogout,
    
    // Vyhledávání
    notifySearchError,
    notifyNoResults,
  }
}
