/* =============================================================
   APÉ ARTIST — Script global (custom.js)
   Consolide tout le JavaScript inline de toutes les pages HTML
   ============================================================= */

/* ══════════════════════════════════════════════════════════════
   FAQ ACCORDION  (index.html, contact.html, cgu.html,
                   confidentialite.html)
   ══════════════════════════════════════════════════════════════ */
function toggleFaq(element) {
    // Fermer les autres items
    document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== element) {
            item.classList.remove('active');
        }
    });
    // Basculer l'item courant
    element.classList.toggle('active');
}

/* ══════════════════════════════════════════════════════════════
   AUTHENTIFICATION  (login.html)
   ══════════════════════════════════════════════════════════════ */
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const btn   = document.getElementById('submitBtn');

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Connexion...';
    btn.disabled  = true;

    // Session simulée
    localStorage.setItem('apeartist_user_email', email);
    localStorage.setItem('apeartist_logged_in',  'true');

    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 800);
}

function handleSocialLogin(provider) {
    localStorage.setItem('apeartist_user_email', provider.toLowerCase() + '_user@apeartist.tg');
    localStorage.setItem('apeartist_logged_in',  'true');
    window.location.href = 'dashboard.html';
}

/* ══════════════════════════════════════════════════════════════
   INSCRIPTION  (register.html)
   ══════════════════════════════════════════════════════════════ */
function handleRegister(event) {
    event.preventDefault();
    const pass        = document.getElementById('regPassword').value;
    const confirmPass = document.getElementById('regConfirmPassword').value;

    if (pass !== confirmPass) {
        alert('Les mots de passe ne correspondent pas.');
        return;
    }

    const firstName   = document.getElementById('regFirstName').value;
    const lastName    = document.getElementById('regLastName').value;
    const email       = document.getElementById('regEmail').value;
    const phone       = document.getElementById('regPhone').value;
    const accountType = document.querySelector('input[name="accountType"]:checked').value;

    const btn = document.getElementById('regSubmitBtn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Création du compte...';
    btn.disabled  = true;

    // Enregistrer dans localStorage
    localStorage.setItem('apeartist_user_name',  firstName + ' ' + lastName);
    localStorage.setItem('apeartist_user_email', email);
    localStorage.setItem('apeartist_user_phone', phone);
    localStorage.setItem('apeartist_user_role',  accountType);
    localStorage.setItem('apeartist_logged_in',  'true');

    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 800);
}

function handleSocialRegister(provider) {
    localStorage.setItem('apeartist_user_name',  'Utilisateur ' + provider);
    localStorage.setItem('apeartist_user_email', provider.toLowerCase() + '_user@apeartist.tg');
    localStorage.setItem('apeartist_logged_in',  'true');
    window.location.href = 'dashboard.html';
}

/* ══════════════════════════════════════════════════════════════
   CONTACT FORM  (contact.html)
   Initialisation après chargement du script externe
   ══════════════════════════════════════════════════════════════ */
function initContactForm() {
    if (typeof ContactForm === 'undefined') return;
    window.contact = ContactForm.create({
        formId: 'contactForm',
        email: {
            to: 'joseph.kakone@gmail.com',
        },
        whatsapp: {
            number: '22891518923',
        },
        language: 'fr',
    });
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD  (dashboard.html)
   ══════════════════════════════════════════════════════════════ */

// Charger les données sauvegardées
window.addEventListener('DOMContentLoaded', () => {

    /* ---------- Données dashboard ---------- */
    const savedName   = localStorage.getItem('apeartist_user_name');
    const savedEmail  = localStorage.getItem('apeartist_user_email');
    const savedPhone  = localStorage.getItem('apeartist_user_phone');
    const savedRole   = localStorage.getItem('apeartist_user_role');
    const savedCity   = localStorage.getItem('apeartist_user_city');
    const savedBio    = localStorage.getItem('apeartist_user_bio');
    const savedAvatar = localStorage.getItem('apeartist_user_avatar');

    if (savedName) {
        const el = document.getElementById('headerGreeting');
        if (el) el.textContent = savedName;
        const navEl = document.getElementById('navUserName');
        if (navEl) navEl.textContent = savedName;
        const parts = savedName.split(' ');
        const fnEl = document.getElementById('settingFirstName');
        if (fnEl) fnEl.value = parts[0] || '';
        const lnEl = document.getElementById('settingLastName');
        if (lnEl) lnEl.value = parts.slice(1).join(' ') || '';
    }

    if (savedEmail) {
        const el = document.getElementById('settingEmail');
        if (el) el.value = savedEmail;
    }

    if (savedPhone) {
        const el = document.getElementById('settingPhone');
        if (el) el.value = savedPhone;
    }

    if (savedRole) {
        const el = document.getElementById('headerRole');
        if (el) el.textContent = savedRole;
        const selEl = document.getElementById('settingRole');
        if (selEl) selEl.value = savedRole;
    }

    if (savedCity) {
        const el = document.getElementById('headerCity');
        if (el) el.textContent = savedCity;
        const inpEl = document.getElementById('settingCity');
        if (inpEl) inpEl.value = savedCity;
    }

    if (savedBio) {
        const el = document.getElementById('settingBio');
        if (el) el.value = savedBio;
    }

    if (savedAvatar) {
        const navAv    = document.getElementById('navAvatar');
        const headAv   = document.getElementById('headerAvatar');
        const formAv   = document.getElementById('formAvatarPreview');
        if (navAv)  navAv.src  = savedAvatar;
        if (headAv) headAv.src = savedAvatar;
        if (formAv) formAv.src = savedAvatar;
    }

    /* ---------- Init contact form si présent ---------- */
    initContactForm();
});

// Gestion des Onglets
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.add('bg-white/5', 'text-gray-400');
    });

    const activeTab = document.getElementById(tabId);
    if (activeTab) activeTab.classList.remove('hidden');

    let btnId = 'btnTabOverview';
    if (tabId === 'tabBookings')   btnId = 'btnTabBookings';
    else if (tabId === 'tabFavorites') btnId = 'btnTabFavorites';
    else if (tabId === 'tabSettings')  btnId = 'btnTabSettings';

    const activeBtn = document.getElementById(btnId);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.classList.remove('bg-white/5', 'text-gray-400');
    }

    window.scrollTo({ top: 200, behavior: 'smooth' });
}

// Toggle tag badges
function toggleTag(el) {
    el.classList.toggle('selected');
}

// Simuler changement d'avatar
const sampleAvatars = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
];
let avatarIndex = 0;

function changeAvatarDemo() {
    avatarIndex = (avatarIndex + 1) % sampleAvatars.length;
    const newUrl = sampleAvatars[avatarIndex];
    const navAv  = document.getElementById('navAvatar');
    const headAv = document.getElementById('headerAvatar');
    const formAv = document.getElementById('formAvatarPreview');
    if (navAv)  navAv.src  = newUrl;
    if (headAv) headAv.src = newUrl;
    if (formAv) formAv.src = newUrl;
    localStorage.setItem('apeartist_user_avatar', newUrl);
    showToast('Photo de profil mise à jour !');
}

function resetAvatar() {
    const defaultUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80';
    const navAv  = document.getElementById('navAvatar');
    const headAv = document.getElementById('headerAvatar');
    const formAv = document.getElementById('formAvatarPreview');
    if (navAv)  navAv.src  = defaultUrl;
    if (headAv) headAv.src = defaultUrl;
    if (formAv) formAv.src = defaultUrl;
    localStorage.setItem('apeartist_user_avatar', defaultUrl);
    showToast('Photo de profil réinitialisée.');
}

// Sauvegarde des paramètres
function saveUserSettings(event) {
    event.preventDefault();

    const firstName   = document.getElementById('settingFirstName').value.trim();
    const lastName    = document.getElementById('settingLastName').value.trim();
    const fullName    = `${firstName} ${lastName}`.trim();
    const email       = document.getElementById('settingEmail').value.trim();
    const phone       = document.getElementById('settingPhone').value.trim();
    const role        = document.getElementById('settingRole').value;
    const city        = document.getElementById('settingCity').value.trim();
    const bio         = document.getElementById('settingBio').value.trim();
    const newPass     = document.getElementById('settingNewPass').value;
    const confirmPass = document.getElementById('settingConfirmPass').value;

    if (newPass && newPass !== confirmPass) {
        alert('Le nouveau mot de passe et sa confirmation ne correspondent pas.');
        return;
    }

    localStorage.setItem('apeartist_user_name',  fullName);
    localStorage.setItem('apeartist_user_email', email);
    localStorage.setItem('apeartist_user_phone', phone);
    localStorage.setItem('apeartist_user_role',  role);
    localStorage.setItem('apeartist_user_city',  city);
    localStorage.setItem('apeartist_user_bio',   bio);

    document.getElementById('headerGreeting').textContent = fullName;
    document.getElementById('navUserName').textContent    = fullName;
    document.getElementById('headerRole').textContent     = role;
    document.getElementById('headerCity').textContent     = city;

    const btn = document.getElementById('saveSettingsBtn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Enregistrement...';

    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-check mr-2"></i> Modifications enregistrées !';
        showToast('Vos informations et paramètres ont été mis à jour avec succès !');
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-floppy-disk mr-2"></i> Enregistrer les modifications';
        }, 2000);
    }, 500);
}

// Afficher Toast
function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    document.getElementById('toastMessage').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Déconnexion
function logoutUser() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        localStorage.removeItem('apeartist_logged_in');
        window.location.href = 'login.html';
    }
}
