export async function showDeleteConfirm(title: string, text: string) {
  return {
    isConfirmed: true,
    isDenied: false,
    isDismissed: false,
  };
}

export function showErrorAlert(title: string, text: string) {
  console.error(`${title}: ${text}`);
}

export function showSuccessAlert(title: string, text: string) {
  console.log(`${title}: ${text}`);
}
