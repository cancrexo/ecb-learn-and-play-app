(function () {
    'use strict';

    var API_BASE = '/backend/api/admin';
    var TOKEN_KEY = 'admin_scores_token';
    var PAGE_SIZE_KEY = 'admin_scores_per_page';
    var DEFAULT_PER_PAGE = 25;
    var MIN_PER_PAGE = 10;
    var MAX_PER_PAGE = 100;

    function loadSavedPageSize() {
        var saved = parseInt(localStorage.getItem(PAGE_SIZE_KEY), 10);
        if (!isNaN(saved) && saved >= MIN_PER_PAGE && saved <= MAX_PER_PAGE) {
            return saved;
        }
        return DEFAULT_PER_PAGE;
    }

    var state = {
        page: 1,
        perPage: loadSavedPageSize(),
        sort: 'completed_at',
        order: 'desc',
        search: '',
    };

    var loginView = document.getElementById('login-view');
    var panelView = document.getElementById('panel-view');
    var loginForm = document.getElementById('login-form');
    var loginError = document.getElementById('login-error');
    var panelError = document.getElementById('panel-error');
    var scoresTbody = document.getElementById('scores-tbody');
    var paginationInfo = document.getElementById('pagination-info');
    var paginationEl = document.getElementById('pagination');
    var filtersForm = document.getElementById('filters-form');
    var pageSizeSelect = document.getElementById('page-size');

    function syncPageSizeSelect() {
        if (pageSizeSelect) {
            pageSizeSelect.value = String(state.perPage);
        }
    }

    function savePageSize(size) {
        localStorage.setItem(PAGE_SIZE_KEY, String(size));
    }

    function getToken() {
        return sessionStorage.getItem(TOKEN_KEY);
    }

    function setToken(token) {
        if (token) {
            sessionStorage.setItem(TOKEN_KEY, token);
        } else {
            sessionStorage.removeItem(TOKEN_KEY);
        }
    }

    function showLogin() {
        loginView.classList.remove('d-none');
        loginView.classList.add('d-block');
        panelView.classList.add('d-none');
        panelView.classList.remove('d-block');
    }

    function showPanel() {
        loginView.classList.add('d-none');
        loginView.classList.remove('d-block');
        panelView.classList.remove('d-none');
        panelView.classList.add('d-block');
    }

    function showLoginError(message) {
        loginError.textContent = message;
        loginError.classList.remove('d-none');
    }

    function hideLoginError() {
        loginError.classList.add('d-none');
        loginError.textContent = '';
    }

    function showPanelError(message) {
        panelError.textContent = message;
        panelError.classList.remove('d-none');
    }

    function hidePanelError() {
        panelError.classList.add('d-none');
        panelError.textContent = '';
    }

    function authHeaders() {
        var headers = { Accept: 'application/json' };
        var token = getToken();
        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }
        return headers;
    }

    function handleUnauthorized() {
        setToken(null);
        showLogin();
        showLoginError('Session expired. Please sign in again.');
    }

    async function apiFetch(path, options) {
        var opts = options || {};
        opts.headers = Object.assign({}, authHeaders(), opts.headers || {});

        var response = await fetch(API_BASE + path, opts);

        if (response.status === 401) {
            handleUnauthorized();
            throw new Error('Unauthorized');
        }

        return response;
    }

    function formatDate(iso) {
        if (!iso) {
            return '—';
        }
        var d = new Date(iso);
        if (isNaN(d.getTime())) {
            return iso;
        }
        return d.toLocaleString('en-GB');
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function updateSortIndicators() {
        document.querySelectorAll('th.sortable').forEach(function (th) {
            var col = th.getAttribute('data-sort');
            var indicator = th.querySelector('.sort-indicator');
            if (!indicator) {
                indicator = document.createElement('span');
                indicator.className = 'sort-indicator';
                th.appendChild(indicator);
            }
            if (col === state.sort) {
                th.classList.add('active');
                indicator.textContent = state.order === 'asc' ? '▲' : '▼';
            } else {
                th.classList.remove('active');
                indicator.textContent = '↕';
            }
        });
    }

    function buildQuery(extra) {
        var params = new URLSearchParams();
        params.set('page', String(state.page));
        params.set('per_page', String(state.perPage));
        params.set('sort', state.sort);
        params.set('order', state.order);
        if (state.search) {
            params.set('search', state.search);
        }
        if (extra) {
            Object.keys(extra).forEach(function (key) {
                params.set(key, extra[key]);
            });
        }
        return params.toString();
    }

    function renderRows(data) {
        if (!data.length) {
            scoresTbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No sessions found.</td></tr>';
            return;
        }

        scoresTbody.innerHTML = data.map(function (row) {
            return (
                '<tr>' +
                '<td>' + escapeHtml(row.username) + '</td>' +
                '<td>' + escapeHtml(row.email) + '</td>' +
                '<td class="text-end fw-semibold">' + escapeHtml(row.total_score) + '</td>' +
                '<td>' + escapeHtml(formatDate(row.completed_at)) + '</td>' +
                '</tr>'
            );
        }).join('');
    }

    function renderPagination(meta) {
        var from = meta.from || 0;
        var to = meta.to || 0;
        var total = meta.total || 0;
        var lastPage = meta.last_page || 1;
        var current = meta.current_page || 1;

        paginationInfo.textContent = total
            ? 'Showing ' + from + '–' + to + ' of ' + total + ' sessions'
            : 'No results';

        if (lastPage <= 1) {
            paginationEl.innerHTML = '';
            return;
        }

        var html = '';

        html += '<li class="page-item' + (current <= 1 ? ' disabled' : '') + '">' +
            '<a class="page-link" href="#" data-page="' + (current - 1) + '">Previous</a></li>';

        var start = Math.max(1, current - 2);
        var end = Math.min(lastPage, current + 2);

        for (var p = start; p <= end; p++) {
            html += '<li class="page-item' + (p === current ? ' active' : '') + '">' +
                '<a class="page-link" href="#" data-page="' + p + '">' + p + '</a></li>';
        }

        html += '<li class="page-item' + (current >= lastPage ? ' disabled' : '') + '">' +
            '<a class="page-link" href="#" data-page="' + (current + 1) + '">Next</a></li>';

        paginationEl.innerHTML = html;
    }

    async function loadScores() {
        hidePanelError();
        scoresTbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Loading…</td></tr>';
        updateSortIndicators();

        try {
            var response = await apiFetch('/scores?' + buildQuery());
            var payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.message || 'Failed to load sessions.');
            }

            renderRows(payload.data || []);
            renderPagination({
                from: payload.from,
                to: payload.to,
                total: payload.total,
                last_page: payload.last_page,
                current_page: payload.current_page,
            });
        } catch (err) {
            if (err.message !== 'Unauthorized') {
                showPanelError(err.message || 'Failed to load sessions.');
                scoresTbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4">Error</td></tr>';
            }
        }
    }

    async function exportExcel() {
        hidePanelError();
        var exportBtn = document.getElementById('export-btn');
        exportBtn.disabled = true;
        exportBtn.textContent = 'Exporting…';

        try {
            var response = await apiFetch('/scores/export?' + buildQuery());

            if (response.status === 422) {
                var errPayload = await response.json();
                throw new Error(errPayload.message || 'Too many rows to export.');
            }

            if (!response.ok) {
                var failPayload = await response.json().catch(function () { return {}; });
                throw new Error(failPayload.message || 'Export failed.');
            }

            var blob = await response.blob();
            var disposition = response.headers.get('Content-Disposition') || '';
            var match = disposition.match(/filename="?([^";]+)"?/i);
            var filename = match ? match[1] : 'sessions.xlsx';

            var url = URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            if (err.message !== 'Unauthorized') {
                showPanelError(err.message || 'Export failed.');
            }
        } finally {
            exportBtn.disabled = false;
            exportBtn.textContent = 'Export Excel';
        }
    }

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        hideLoginError();

        var submitBtn = document.getElementById('login-submit');
        submitBtn.disabled = true;

        try {
            var response = await fetch(API_BASE + '/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    username: document.getElementById('login-username').value.trim(),
                    password: document.getElementById('login-password').value,
                }),
            });

            var payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.message || 'Invalid credentials.');
            }

            setToken(payload.token);
            document.getElementById('login-password').value = '';
            showPanel();
            state.page = 1;
            await loadScores();
        } catch (err) {
            showLoginError(err.message || 'Sign in failed.');
        } finally {
            submitBtn.disabled = false;
        }
    });

    document.getElementById('logout-btn').addEventListener('click', async function () {
        try {
            await apiFetch('/logout', { method: 'POST' });
        } catch (err) {
            // Ignorar: ya se limpia la sesión local
        }
        setToken(null);
        showLogin();
    });

    filtersForm.addEventListener('submit', function (event) {
        event.preventDefault();
        state.search = document.getElementById('filter-search').value.trim();
        state.page = 1;
        loadScores();
    });

    document.getElementById('clear-filters-btn').addEventListener('click', function () {
        document.getElementById('filter-search').value = '';
        state.search = '';
        state.page = 1;
        loadScores();
    });

    document.getElementById('export-btn').addEventListener('click', exportExcel);

    document.querySelectorAll('th.sortable').forEach(function (th) {
        th.addEventListener('click', function () {
            var col = th.getAttribute('data-sort');
            if (state.sort === col) {
                state.order = state.order === 'asc' ? 'desc' : 'asc';
            } else {
                state.sort = col;
                state.order = col === 'total_score' || col === 'completed_at' ? 'desc' : 'asc';
            }
            state.page = 1;
            loadScores();
        });
    });

    paginationEl.addEventListener('click', function (event) {
        var link = event.target.closest('a[data-page]');
        if (!link) {
            return;
        }
        event.preventDefault();
        var page = parseInt(link.getAttribute('data-page'), 10);
        if (isNaN(page) || page < 1) {
            return;
        }
        state.page = page;
        loadScores();
    });

    syncPageSizeSelect();

    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', function () {
            var size = parseInt(pageSizeSelect.value, 10);
            if (isNaN(size) || size < MIN_PER_PAGE || size > MAX_PER_PAGE) {
                syncPageSizeSelect();
                return;
            }
            state.perPage = size;
            state.page = 1;
            savePageSize(size);
            loadScores();
        });
    }

    if (getToken()) {
        showPanel();
        loadScores();
    } else {
        showLogin();
    }

    var togglePasswordBtn = document.getElementById('toggle-password-btn');
    var loginPasswordInput = document.getElementById('login-password');
    var iconEye = document.getElementById('icon-eye');
    var iconEyeSlash = document.getElementById('icon-eye-slash');

    if (togglePasswordBtn && loginPasswordInput) {
        togglePasswordBtn.addEventListener('click', function () {
            var visible = loginPasswordInput.type === 'text';
            loginPasswordInput.type = visible ? 'password' : 'text';
            iconEye.classList.toggle('d-none', !visible);
            iconEyeSlash.classList.toggle('d-none', visible);
            togglePasswordBtn.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
            togglePasswordBtn.setAttribute('title', visible ? 'Show password' : 'Hide password');
        });
    }
})();
