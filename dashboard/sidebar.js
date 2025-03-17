function createSidebar() {
    return `
        <nav class="sidebar">
            <div class="sidebar-header"><h2>Dashboard</h2></div>
            <ul class="menu">
                <li class="menu-item"><a href="/dashboard/users.html"><span>👥</span> Users</a></li>
                <li class="menu-item"><a href="/dashboard/artist"><span>🎤</span> Artists</a></li>
                <li class="menu-item"><a href="#"><span>🎵</span> Music</a></li>
            </ul>
            <div class="user-info">
                <span id="userRole"></span>
                <button id="logoutBtn">Logout</button>
            </div>
        </nav>
    `;
}
document.getElementById("sidebar").innerHTML = createSidebar();