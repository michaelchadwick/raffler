/* Modal */
/* custom class for modals */
/* eslint-disable no-unused-vars */

class Modal {
  constructor(modalType, modalTitle, modalText, acceptText, cancelText) {
    this.modalDelay = 1500
    this.modalType = modalType || 'perm';
    this.modalTitle = modalTitle || 'Confirmation';
    this.modalText = modalText || 'Are you sure you want to do this?';

    if (acceptText) {
      this.acceptText = acceptText || 'Yes';
    } else {
      this.acceptText = null;
    }
    if (cancelText) {
      this.cancelText = cancelText || 'No';
    } else {
      this.cancelText = null;
    }

    this.parent = document.body;

    this.modal = undefined;
    this.acceptButton = undefined;
    this.cancelButton = undefined;
    this.closeButton = undefined;

    this._createModal(modalType);

    if (modalType == 'temp') {
      // close temp modals after delay
      var modal = this
      setTimeout(function(modal) {
        modal._destroyModal()
      }.bind(this, modal), this.modalDelay)
    }
  }

  question() {
    return new Promise((resolve, reject) => {
      if (!this.modal || !this.acceptButton || !this.cancelButton) {
        reject('There was a problem creating the modal window!');
        return;
      }
      this.acceptButton.focus();

      this.acceptButton.addEventListener('click', () => {
        resolve(true);
        this._destroyModal();
      });

      this.cancelButton.addEventListener('click', () => {
        resolve(false);
        this._destroyModal();
      });
    })
  }

  _createModal(modalType) {
    // Background dialog
    this.modal = document.createElement('dialog');
    this.modal.classList.add('modal-dialog');
    if (modalType == 'confirm' || modalType == 'confirm-debug') {
      this.modal.classList.add('modal-confirm');
    }

    if (modalType == 'temp') {
      this.modal.classList.add('temp');
    }

    // Message window
    const window = document.createElement('div');
    window.classList.add('modal-window');
    window.classList.add('animate__animated', 'animate__fadeInUp');

    if (modalType == 'perm-debug' || modalType == 'confirm-debug') {
      window.classList.add('debug');
    }
    this.modal.appendChild(window);

    // if not a temporary modal, add a title and close button
    if (modalType != 'temp') {
      // Title
      const title = document.createElement('div');
      title.classList.add('modal-title');
      if (modalType == 'perm-debug' || modalType == 'confirm-debug') {
        title.classList.add('debug');
      }
      window.appendChild(title);

      // Title text
      const titleText = document.createElement('div');
      titleText.textContent = this.modalTitle;
      title.appendChild(titleText);

      // Close
      if (modalType == 'perm' || modalType == 'perm-debug') {
        this.closeButton = document.createElement('button');
        this.closeButton.type = 'button';
        this.closeButton.innerHTML = '&times;';
        this.closeButton.classList.add('modal-close');
        this.closeButton.addEventListener('click', () => {
          this._destroyModal();
        });
        title.appendChild(this.closeButton);
      }
    }

    // Main text
    const text = document.createElement('div');
    text.classList.add('modal-text');
    text.innerHTML = this.modalText;
    window.appendChild(text);

    // if a confirm modal, add buttons
    if (modalType == 'confirm' || modalType == 'confirm-debug') {
      // Accept and cancel button group
      const buttonGroup = document.createElement('div');
      buttonGroup.classList.add('modal-button-group');
      if (modalType == 'confirm-debug') {
        buttonGroup.classList.add('debug');
      }
      window.appendChild(buttonGroup);

      // Cancel button
      this.cancelButton = document.createElement('button');
      this.cancelButton.type = 'button';
      this.cancelButton.classList.add('modal-button');
      this.cancelButton.classList.add('modal-button-secondary');
      this.cancelButton.classList.add('modal-button-regular');
      this.cancelButton.textContent = this.cancelText;
      buttonGroup.appendChild(this.cancelButton);

      // Accept button
      this.acceptButton = document.createElement('button');
      this.acceptButton.type = 'button';
      this.acceptButton.classList.add('modal-button');
      this.acceptButton.classList.add('modal-button-primary');
      this.acceptButton.classList.add('modal-button-regular');
      this.acceptButton.textContent = this.acceptText;
      buttonGroup.appendChild(this.acceptButton);
    }

    // Let's rock
    this.parent.appendChild(this.modal);
  }

  _destroyModal() {
    this.parent.removeChild(this.modal);
    delete this;
  }
}
