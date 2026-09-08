/* ============================================================
   data.js — the curriculum, quizzes, and project briefs.
   This is the content layer. Nothing here touches localStorage —
   see storage.js / state.js for persistence.

   Each CATEGORY has one or more UNITS. A unit is either:
     developed: true  -> full lectures[] with lesson content + quiz
     developed: false -> lectures is a plain array of lecture titles
                          (curriculum is mapped out, content pending)
   ============================================================ */

const CATALOG = {
  categories: [

    // ============================================================
    // 1. LINUX
    // ============================================================
    {
      id: 'linux', name: 'Linux', tagline: 'The operating system every DevOps engineer lives in.',
      units: [
        {
          id: 'linux-fundamentals', name: 'Linux Fundamentals', developed: true,
          lectures: [
            {
              id: 'lx-what-is-linux', title: 'What Is Linux?', estMinutes: 12,
              objectives: [
                'Explain what a kernel is and why Linux is described as "just the kernel."',
                'Describe the client-server and multi-user model Linux was built around.',
                'Explain why almost all cloud and container infrastructure runs on Linux.'
              ],
              lesson: [
                'Linux is, strictly speaking, a kernel — the core program that talks directly to CPU, memory, storage, and network hardware, and hands out those resources to every other running program. What most people call "Linux" is really a full operating system built around that kernel: a shell, core utilities, system services, and a package manager, bundled together by a distribution.',
                'Linux was designed from day one as multi-user and multi-process: many users and many programs share the same machine safely, each isolated by permissions and process boundaries. That design is exactly why Linux became the default substrate for servers — a single machine can run dozens of isolated services without one bringing down another.',
                'For DevOps specifically, Linux is unavoidable: the vast majority of cloud VMs, nearly all containers (including Windows-hosted ones, which run a Linux VM under the hood), and almost every CI/CD runner boot Linux. Understanding it isn\'t optional background knowledge — it\'s the substrate everything else in this curriculum sits on top of.'
              ],
              keyConcepts: ['Kernel vs. operating system vs. distribution', 'Multi-user, multi-process design', 'Open source licensing (GPL) and how distributions differ'],
              practical: 'When you launch an EC2 instance, a GKE node, or a GitHub Actions runner, you are booting a Linux distribution. The distro (Ubuntu, Amazon Linux, Debian, Alpine) changes the package manager and default tooling, but the kernel concepts — processes, permissions, filesystems — are identical everywhere.',
              commands: ['uname -r        # kernel version', 'cat /etc/os-release   # distro identification', 'hostnamectl     # system + kernel summary'],
              mistakes: ['Treating "Linux" and "Ubuntu" (or any one distro) as synonyms — this causes confusion when a command that works on Ubuntu doesn\'t exist on Alpine or Amazon Linux.', 'Assuming GUI-based troubleshooting habits transfer directly — most production Linux systems are managed entirely over SSH with no desktop environment.'],
              interview: ['Be ready to explain, in one or two sentences, the difference between the kernel and a distribution — this is one of the most common Linux screening questions.', 'Know why containers share the host kernel instead of each running their own — it\'s the foundation of why containers are lighter than VMs.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which of the following statements about the Linux kernel are correct?', options: [
                  { id: 'a', text: 'The kernel manages access to CPU, memory, and hardware devices' },
                  { id: 'b', text: 'The kernel is the same thing as a Linux distribution' },
                  { id: 'c', text: 'The kernel enables multiple processes to run concurrently in isolation' },
                  { id: 'd', text: 'The kernel is a graphical desktop environment' },
                ], correct: ['a', 'c'], explanation: 'The kernel is the low-level core that arbitrates hardware access and process scheduling. A distribution bundles the kernel with a shell, utilities, and a package manager — they are not the same thing, and neither is a GUI.' },
                { id: 'q2', text: 'Why is Linux the dominant OS for cloud servers and containers?', options: [
                  { id: 'a', text: 'It is free to use in most distributions' },
                  { id: 'b', text: 'Its multi-user, multi-process design suits shared, isolated workloads' },
                  { id: 'c', text: 'It requires a GUI to be administered' },
                  { id: 'd', text: 'Containers share the host kernel, making Linux containers lightweight' },
                ], correct: ['a', 'b', 'd'], explanation: 'Cost, multi-tenant design, and kernel-sharing for containers are all real drivers of Linux\'s dominance. A GUI is not required — most servers are headless.' },
              ]}
            },
            {
              id: 'lx-distributions', title: 'Linux Distributions', estMinutes: 10,
              objectives: ['Distinguish major distribution families and their package managers.', 'Choose an appropriate distribution for a given DevOps use case.'],
              lesson: [
                'A "distribution" (distro) is the kernel plus a curated set of packages, defaults, and a package manager. Distros generally fall into families: Debian-based (Debian, Ubuntu) using APT and .deb packages; Red Hat-based (RHEL, CentOS Stream, Amazon Linux, Fedora) using YUM/DNF and .rpm packages; and minimal/independent distros like Alpine, built around musl libc and apk for extremely small container images.',
                'In DevOps work you rarely pick a distro out of personal preference — the choice is usually driven by what your cloud provider optimizes for (Amazon Linux on AWS), what your base images use (Alpine or Debian-slim for containers), or organizational standardization (RHEL for compliance-heavy enterprises).'
              ],
              keyConcepts: ['APT vs YUM/DNF vs APK', 'LTS (Long Term Support) release cycles', 'Why container base images favor Alpine or "slim" variants'],
              practical: 'A common real-world trap: writing a Dockerfile against Ubuntu, then switching the base image to Alpine for size and discovering `apt-get` doesn\'t exist and glibc-only binaries fail under musl. Knowing your distro family before you write install commands avoids this entirely.',
              commands: ['apt update && apt install -y <pkg>   # Debian/Ubuntu', 'dnf install -y <pkg>                 # RHEL/Fedora/Amazon Linux 2023', 'apk add <pkg>                        # Alpine'],
              mistakes: ['Copy-pasting install commands between distro families without translating the package manager.', 'Assuming Alpine\'s musl libc behaves identically to glibc for compiled binaries — it frequently does not.'],
              interview: ['Be able to name at least one distro from each major family and its package manager without hesitation.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which pairings of distribution family and package manager are correct?', options: [
                  { id: 'a', text: 'Debian/Ubuntu → APT' },
                  { id: 'b', text: 'RHEL/Fedora/Amazon Linux → DNF or YUM' },
                  { id: 'c', text: 'Alpine → APK' },
                  { id: 'd', text: 'Ubuntu → DNF' },
                ], correct: ['a', 'b', 'c'], explanation: 'Ubuntu is Debian-based and uses APT, not DNF.' },
                { id: 'q2', text: 'Why might a Dockerfile that works on Debian fail after switching the base image to Alpine?', options: [
                  { id: 'a', text: 'Alpine uses musl libc, which can behave differently for compiled binaries' },
                  { id: 'b', text: 'apt-get is not available on Alpine' },
                  { id: 'c', text: 'Alpine cannot run inside Docker' },
                  { id: 'd', text: 'Alpine has no package manager at all' },
                ], correct: ['a', 'b'], explanation: 'Alpine ships apk, not apt, and its musl libc can cause subtle incompatibilities with binaries compiled against glibc. Alpine runs in Docker fine and does have a package manager.' },
              ]}
            },
            {
              id: 'lx-architecture', title: 'Linux Architecture', estMinutes: 10,
              objectives: ['Describe the layered architecture: hardware, kernel, shell, applications.', 'Explain the role of system calls.'],
              lesson: [
                'Linux architecture is layered: hardware at the bottom, the kernel managing that hardware, a shell (or other user-space programs) that lets you interact with the kernel, and applications running on top. Programs never touch hardware directly — they request kernel services through system calls (syscalls), a controlled API boundary.',
                'This layering is what makes permissions and isolation possible: a process can only do what the kernel allows it to do through syscalls, which is also the foundation container runtimes rely on (namespaces and cgroups are kernel features exposed via syscalls, not separate subsystems).'
              ],
              keyConcepts: ['Kernel space vs. user space', 'System calls as the only path to hardware', 'Shell as a user-space interpreter, not part of the kernel'],
              practical: 'Tools like `strace` let you watch the exact system calls a program makes — invaluable when debugging why a containerized process can\'t open a file or bind a port, since the failure usually shows up at the syscall layer first.',
              commands: ['strace -c ls    # summarize which syscalls a command makes', 'ltrace <cmd>    # trace library calls (where available)'],
              mistakes: ['Assuming the shell is "part of the kernel" — it\'s an ordinary user-space program, replaceable (bash, zsh, sh, fish all work identically from the kernel\'s point of view).'],
              interview: ['Be able to explain, at a high level, why a process cannot directly access a disk or network card without going through the kernel.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements about Linux architecture are true?', options: [
                  { id: 'a', text: 'Applications interact with hardware directly for performance' },
                  { id: 'b', text: 'The kernel mediates access to hardware through system calls' },
                  { id: 'c', text: 'The shell is a user-space program, not a kernel component' },
                  { id: 'd', text: 'Namespaces and cgroups, used by containers, are kernel features' },
                ], correct: ['b', 'c', 'd'], explanation: 'User-space applications never touch hardware directly — they always go through the kernel via syscalls.' },
              ]}
            },
            {
              id: 'lx-terminal', title: 'The Linux Terminal', estMinutes: 8,
              objectives: ['Explain the difference between a terminal, a shell, and a TTY.', 'Navigate the terminal confidently.'],
              lesson: [
                'The "terminal" is the program that displays text and captures keystrokes (a terminal emulator, historically a physical TTY device). The "shell" is the program that interprets what you type — bash and zsh are shells. They are separate concepts that are easy to conflate: you can run different shells inside the same terminal emulator.',
                'Nearly all remote server administration happens through a terminal connected via SSH, with no graphical layer at all. Comfort in the terminal — history, tab completion, keyboard shortcuts — is a daily productivity multiplier, not an optional skill.'
              ],
              keyConcepts: ['Terminal emulator vs. shell vs. TTY', 'Command history and reverse search (Ctrl+R)', 'Tab completion'],
              practical: 'Production incident response is almost always done over SSH in a terminal under time pressure — muscle memory with history search and completion directly reduces mean-time-to-resolution.',
              commands: ['history          # view command history', 'Ctrl+R           # reverse search history', 'echo $SHELL      # show current shell'],
              mistakes: ['Retyping long commands instead of using history/reverse-search.'],
              interview: ['Know the distinction between shell and terminal — it comes up when discussing shell scripting portability.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements correctly distinguish terminal from shell?', options: [
                  { id: 'a', text: 'The terminal displays text and captures input' },
                  { id: 'b', text: 'The shell interprets commands you type' },
                  { id: 'c', text: 'The terminal and shell are always the same program' },
                  { id: 'd', text: 'You can run different shells inside the same terminal emulator' },
                ], correct: ['a', 'b', 'd'], explanation: 'Terminal and shell are distinct layers — you could run bash, zsh, or sh in the same terminal emulator.' },
              ]}
            },
            {
              id: 'lx-filesystem', title: 'The Linux Filesystem', estMinutes: 10,
              objectives: ['Explain that "everything is a file" in Linux.', 'Understand mount points and filesystem types.'],
              lesson: [
                'Linux follows a "everything is a file" philosophy: regular files, directories, devices, sockets, and even process information are all represented as files navigable through a single unified tree rooted at `/`. There is no concept of drive letters — external storage is mounted into the existing tree at a chosen mount point.',
                'Multiple filesystem types (ext4, xfs, tmpfs, overlayfs) can coexist under that one tree. Overlayfs specifically matters for DevOps engineers because it\'s the filesystem Docker uses to layer container images.'
              ],
              keyConcepts: ['Single rooted tree with mount points, no drive letters', 'ext4 vs xfs vs tmpfs vs overlayfs', 'Devices as files under /dev'],
              practical: 'Understanding overlayfs explains why Docker images are built in layers and why changes inside a stopped container\'s writable layer disappear if you don\'t commit or use a volume.',
              commands: ['mount | column -t   # list mounted filesystems', 'df -hT              # disk usage with filesystem type', 'lsblk               # list block devices'],
              mistakes: ['Expecting Windows-style drive letters or assuming every mounted filesystem is the same type as root.'],
              interview: ['Be able to explain "everything is a file" with a concrete example (e.g., /dev/sda, a named pipe, or /proc entries).'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements about the Linux filesystem are correct?', options: [
                  { id: 'a', text: 'Linux uses drive letters like C: and D:' },
                  { id: 'b', text: 'Devices can be represented as files under /dev' },
                  { id: 'c', text: 'Multiple filesystem types can be mounted under one tree' },
                  { id: 'd', text: 'Overlayfs is used by Docker to implement image layering' },
                ], correct: ['b', 'c', 'd'], explanation: 'Linux has no drive letters — storage is mounted into a single tree rooted at /.' },
              ]}
            },
            {
              id: 'lx-dir-structure', title: 'Linux Directory Structure', estMinutes: 10,
              objectives: ['Know the purpose of key top-level directories (FHS).', 'Locate configuration, binaries, and logs by convention.'],
              lesson: [
                'The Filesystem Hierarchy Standard (FHS) defines what each top-level directory is for: `/etc` holds system-wide configuration, `/var` holds variable data like logs and caches, `/home` holds user data, `/usr` holds installed software, `/bin` and `/sbin` hold essential binaries, `/tmp` holds ephemeral files, and `/proc` and `/sys` expose kernel and process state as virtual files.',
                'This convention is what lets you troubleshoot an unfamiliar server confidently: you already know logs live under `/var/log`, configs under `/etc`, and that anything in `/tmp` can vanish on reboot — regardless of which distro you\'re on.'
              ],
              keyConcepts: ['/etc, /var, /home, /usr, /bin, /tmp, /proc, /sys purposes', 'FHS as a cross-distro convention'],
              practical: 'When a service misbehaves in production, the FHS gives you a search order without documentation: check `/var/log/<service>` for logs, `/etc/<service>` for config, and `systemctl status` for runtime state.',
              commands: ['ls /etc /var/log /usr/bin | less', 'cat /proc/cpuinfo   # kernel-exposed hardware info'],
              mistakes: ['Storing persistent application data in /tmp, which can be cleared automatically by the OS.'],
              interview: ['Be able to say, without looking it up, where logs and configuration typically live on a Linux system.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which directory purposes are correctly matched?', options: [
                  { id: 'a', text: '/etc — system-wide configuration files' },
                  { id: 'b', text: '/var/log — application and system logs' },
                  { id: 'c', text: '/tmp — guaranteed permanent storage' },
                  { id: 'd', text: '/home — per-user data and settings' },
                ], correct: ['a', 'b', 'd'], explanation: '/tmp is explicitly ephemeral and may be cleared by the system — it is not guaranteed permanent.' },
              ]}
            },
          ]
        },
        { id: 'linux-files', name: 'Files & Directories', developed: false, lectures: ['pwd', 'ls', 'cd', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'find', 'locate', 'File Searching'] },
        { id: 'linux-users', name: 'Users & Groups', developed: false, lectures: ['Linux Users', 'Groups', 'useradd', 'usermod', 'userdel', 'groupadd', '/etc/passwd', '/etc/group', '/etc/shadow'] },
        {
          id: 'linux-permissions', name: 'Linux Permissions', developed: true,
          lectures: [
            {
              id: 'lx-perm-model', title: 'The Permission Model', estMinutes: 12,
              objectives: ['Explain the owner/group/other permission model.', 'Read the output of `ls -l` fluently.'],
              lesson: [
                'Every file and directory on Linux has three permission sets: for the owning user, the owning group, and everyone else ("other"). Each set can independently allow read, write, and execute. This is the entire access-control model for the vast majority of files on a Linux system — no per-user access control lists are needed for most day-to-day administration.',
                'Running `ls -l` shows this as a 10-character string like `-rwxr-xr--`: the first character is the file type (`-` for regular file, `d` for directory, `l` for symlink), then three groups of three characters for owner, group, and other permissions respectively.'
              ],
              keyConcepts: ['Owner / Group / Other', 'Read (r), Write (w), Execute (x)', 'File type character in ls -l output'],
              practical: 'On a shared build server, you might set a script to be readable and executable by the whole team\'s group but writable only by its owner — preventing accidental edits while allowing everyone to run it.',
              commands: ['ls -l file.sh', 'stat file.sh   # more detail on ownership and timestamps'],
              mistakes: ['Confusing "execute" on a directory (which controls whether you can enter/traverse it) with execute on a file (which controls whether it can be run).'],
              interview: ['Be able to read a raw `-rwxr-xr--` string aloud and state exactly who can do what.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'For the permission string `-rwxr-xr--`, which statements are correct?', options: [
                  { id: 'a', text: 'The owner can read, write, and execute the file' },
                  { id: 'b', text: 'The group can write to the file' },
                  { id: 'c', text: 'Others can only read the file' },
                  { id: 'd', text: 'This represents a directory' },
                ], correct: ['a', 'c'], explanation: 'The leading `-` means regular file, not directory. Group has r-x (no write), and other has r-- (read only).' },
                { id: 'q2', text: 'What does the execute bit mean on a directory versus a regular file?', options: [
                  { id: 'a', text: 'On a file, it allows the file to be run as a program or script' },
                  { id: 'b', text: 'On a directory, it allows traversing/entering the directory' },
                  { id: 'c', text: 'It means exactly the same thing on both' },
                  { id: 'd', text: 'On a directory, it allows listing contents regardless of the read bit' },
                ], correct: ['a', 'b'], explanation: 'Execute means something different for directories (traverse) versus files (run). Listing contents requires the read bit, not execute.' },
              ]}
            },
            {
              id: 'lx-chmod', title: 'chmod — Changing Permissions', estMinutes: 12,
              objectives: ['Use chmod with both numeric and symbolic notation.', 'Choose appropriate permission levels for a given file type.'],
              lesson: [
                'chmod changes the permission bits on a file or directory. Numeric (octal) notation assigns a digit 0–7 to each of owner/group/other, where read=4, write=2, execute=1, summed together — 7 means rwx, 6 means rw-, 5 means r-x. Symbolic notation instead uses letters: `u` (user/owner), `g` (group), `o` (other), `a` (all), with `+`, `-`, `=` to add, remove, or set permissions.',
                'Numeric mode is faster once memorized and is what you\'ll see in nearly all scripts and documentation; symbolic mode is useful for incremental changes (like `chmod +x` to just add execute without touching the rest of the bits).'
              ],
              keyConcepts: ['Octal values: r=4, w=2, x=1', 'Symbolic operators: u/g/o/a and +/-/='],
              practical: 'A common real pattern: `chmod 600 id_rsa` on an SSH private key — SSH will refuse to use a key that\'s readable by group or other, because a leaked private key compromises every system it can authenticate to.',
              commands: ['chmod 755 script.sh   # rwxr-xr-x', 'chmod 600 id_rsa      # rw------- (private key)', 'chmod +x deploy.sh    # add execute for all, keep everything else'],
              mistakes: ['Running `chmod 777` as a quick fix for "permission denied" errors — this removes all access control and is a common security finding in audits.', 'Forgetting that a script also needs its shebang line and correct ownership, not just the execute bit, to run as intended.'],
              interview: ['Be able to convert between symbolic (`rwxr-xr-x`) and numeric (`755`) notation on the spot.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which numeric chmod values are correctly matched to their symbolic equivalent?', options: [
                  { id: 'a', text: '755 = rwxr-xr-x' },
                  { id: 'b', text: '644 = rw-r--r--' },
                  { id: 'c', text: '600 = rwxrwxrwx' },
                  { id: 'd', text: '700 = rwx------' },
                ], correct: ['a', 'b', 'd'], explanation: '600 is rw------- (owner read/write only), not rwxrwxrwx (which would be 777).' },
                { id: 'q2', text: 'Why is `chmod 777` considered risky in production environments?', options: [
                  { id: 'a', text: 'It grants full read, write, and execute to everyone on the system' },
                  { id: 'b', text: 'It is a common finding flagged in security audits' },
                  { id: 'c', text: 'It makes the file impossible to delete' },
                  { id: 'd', text: 'It disables all access control on that file' },
                ], correct: ['a', 'b', 'd'], explanation: '777 removes any meaningful access restriction; it does not affect deletability, which depends on directory permissions instead.' },
              ]}
            },
            {
              id: 'lx-chown', title: 'chown & chgrp — Ownership', estMinutes: 8,
              objectives: ['Change file owner and group.', 'Understand who is allowed to change ownership.'],
              lesson: [
                'chown changes the owning user (and optionally group, with `user:group` syntax) of a file. chgrp changes just the group. Only root (or a user with sudo) can change ownership to another user — regular users cannot give away files they own to someone else, which prevents a user from dodging disk quota or accountability by reassigning files.',
                'Ownership and permissions work together: permissions define what owner/group/other can do, but ownership defines who the "owner" and "group" actually are for a given file.'
              ],
              keyConcepts: ['chown user:group file', 'Only privileged users can reassign ownership', '-R for recursive ownership changes'],
              practical: 'After extracting a tarball as root, files often end up owned by root even though a service should run as a dedicated non-root user — a very common cause of "permission denied" errors right after deployment, fixed with `chown -R appuser:appgroup /app`.',
              commands: ['chown appuser:appgroup /app -R', 'chgrp deploy release.tar.gz', 'ls -l /app   # verify ownership after change'],
              mistakes: ['Forgetting -R when an entire directory tree needs new ownership, leaving some files inconsistent.'],
              interview: ['Know that regular users cannot chown files to another user\'s ownership — only root can.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements about chown/chgrp are correct?', options: [
                  { id: 'a', text: 'chown can change both owner and group in one command' },
                  { id: 'b', text: 'A regular (non-root) user can give away a file to another user' },
                  { id: 'c', text: 'chgrp changes only the group of a file' },
                  { id: 'd', text: '-R applies the change recursively to a directory tree' },
                ], correct: ['a', 'c', 'd'], explanation: 'Only root/sudo can reassign a file to a different owner — regular users cannot give files away.' },
              ]}
            },
            {
              id: 'lx-special-perms', title: 'Special Permissions: SUID, SGID, Sticky Bit', estMinutes: 12,
              objectives: ['Explain SUID, SGID, and the sticky bit and when each is used.', 'Recognize the security implications of SUID binaries.'],
              lesson: [
                'Beyond the standard rwx bits, Linux has three special permissions. SUID (SetUID) on an executable makes it run with the file owner\'s privileges rather than the invoking user\'s — this is how `passwd` lets a normal user change their own password despite that requiring root access to `/etc/shadow`. SGID on a directory makes new files created inside inherit the directory\'s group rather than the creating user\'s primary group, which is useful for shared team directories. The sticky bit on a directory (classically seen on `/tmp`) restricts deletion so only a file\'s owner (or root) can remove it, even if others have write access to the directory.',
                'SUID in particular is a well-known attack surface: an SUID binary owned by root that has a vulnerability (or is intentionally malicious) grants root-equivalent access to anyone who can execute it, which is why security audits regularly scan systems for unexpected SUID binaries.'
              ],
              keyConcepts: ['SUID: run as file owner (4000)', 'SGID: inherit group on directory (2000)', 'Sticky bit: restrict deletion (1000)'],
              practical: 'A team shared-output directory is a textbook SGID use case: `chmod g+s /shared/output` ensures every file dropped there by any team member automatically belongs to the team\'s group, instead of individual users\' personal groups, keeping permissions consistent without manual chgrp calls.',
              commands: ['chmod u+s /usr/bin/somebinary   # set SUID', 'chmod g+s /shared/team-dir      # set SGID', 'chmod +t /tmp                   # set sticky bit', 'find / -perm -4000 -type f 2>/dev/null   # audit SUID binaries'],
              mistakes: ['Setting SUID on a custom script "to make it easier" — most shells ignore SUID on scripts for security reasons, and even where honored it\'s a serious risk if the script isn\'t carefully audited.'],
              interview: ['Be ready to explain why `/usr/bin/passwd` needs SUID and what would break without it.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements about special Linux permissions are correct?', options: [
                  { id: 'a', text: 'SUID makes an executable run with the file owner\'s privileges' },
                  { id: 'b', text: 'SGID on a directory makes new files inherit that directory\'s group' },
                  { id: 'c', text: 'The sticky bit prevents anyone but the file owner (or root) from deleting files in a shared directory' },
                  { id: 'd', text: 'SUID binaries are never a security concern' },
                ], correct: ['a', 'b', 'c'], explanation: 'SUID binaries are a well-documented attack surface — they are absolutely a security concern and are routinely audited for.' },
                { id: 'q2', text: 'Why does /usr/bin/passwd typically have the SUID bit set?', options: [
                  { id: 'a', text: 'So any user can update /etc/shadow, which normally requires root' },
                  { id: 'b', text: 'So the binary runs faster' },
                  { id: 'c', text: 'Because /etc/shadow is only writable by root' },
                  { id: 'd', text: 'To let non-root users temporarily gain the file owner\'s (root\'s) privileges just for that operation' },
                ], correct: ['a', 'c', 'd'], explanation: 'SUID exists precisely to bridge that gap — letting a controlled binary perform a privileged operation on behalf of a normal user. It has nothing to do with execution speed.' },
              ]}
            },
            {
              id: 'lx-acl', title: 'Access Control Lists (ACL)', estMinutes: 10,
              objectives: ['Explain why ACLs exist beyond owner/group/other.', 'Use getfacl/setfacl at a conceptual level.'],
              lesson: [
                'The owner/group/other model can only express permissions for exactly one user and exactly one group per file. ACLs (Access Control Lists) extend this to grant specific permissions to additional named users or groups on the same file, without changing its base ownership — useful when, say, one extra contractor needs read access to a directory owned by a different team, without adding them to that team\'s group.',
                'ACLs are more expressive but also more complex to audit; most environments use them sparingly, for genuine exceptions, rather than as the default access model.'
              ],
              keyConcepts: ['getfacl / setfacl', 'ACLs extend, not replace, standard permissions', 'Use sparingly — harder to audit at scale'],
              practical: 'Granting a single auditor read-only access to a log directory owned by another team, without adding them to that team\'s Unix group, is a canonical ACL use case.',
              commands: ['getfacl /shared/logs', 'setfacl -m u:auditor:r-x /shared/logs'],
              mistakes: ['Reaching for ACLs as a default instead of first asking whether standard group-based permissions solve the problem more simply.'],
              interview: ['Be able to explain in one sentence why ACLs exist when owner/group/other already exists.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements about ACLs are correct?', options: [
                  { id: 'a', text: 'ACLs let you grant permissions to additional users/groups beyond owner/group/other' },
                  { id: 'b', text: 'ACLs replace the standard permission model entirely' },
                  { id: 'c', text: 'setfacl is used to modify an ACL' },
                  { id: 'd', text: 'ACLs should generally be used for exceptions, not as the default access model' },
                ], correct: ['a', 'c', 'd'], explanation: 'ACLs extend the standard model — they coexist with, not replace, owner/group/other permissions.' },
              ]}
            },
          ]
        },
        { id: 'linux-processes', name: 'Processes & Services', developed: false, lectures: ['Processes', 'ps', 'top', 'htop', 'kill', 'Signals', 'systemd', 'systemctl', 'Services'] },
        { id: 'linux-networking', name: 'Networking (Linux tools)', developed: false, lectures: ['ip', 'ping', 'traceroute', 'ss', 'netstat', 'curl', 'wget', 'DNS commands', 'Network troubleshooting'] },
        { id: 'linux-storage', name: 'Storage & Logs', developed: false, lectures: ['df', 'du', 'mount', 'Disks', 'Partitions', 'Filesystems', '/var/log', 'Log analysis', 'journalctl'] },
        {
          id: 'linux-bash', name: 'Bash Scripting', developed: true,
          lectures: [
            {
              id: 'bash-fundamentals', title: 'Bash Fundamentals & Variables', estMinutes: 14,
              objectives: ['Write and execute a basic bash script.', 'Declare and use variables correctly.'],
              lesson: [
                'A bash script is a text file of shell commands, run top to bottom by the bash interpreter, made executable with a shebang line (`#!/bin/bash`) at the top and the execute permission bit set. Variables are declared without a `$` (`name=value`) and referenced with a `$` (`$name`) — critically, there must be no spaces around the `=` in an assignment, which trips up nearly everyone at first.',
                'Bash has no strong typing — everything is fundamentally a string unless you explicitly use arithmetic contexts like `$(( ))`. Quoting matters enormously: unquoted variables undergo word splitting and glob expansion, which is a common source of subtle bugs when a value contains spaces.'
              ],
              keyConcepts: ['Shebang line (#!/bin/bash)', 'Variable assignment: no spaces around =', 'Quoting: "$var" vs $var', 'Command substitution: $(command)'],
              practical: 'Automation scripts (backup rotation, log cleanup, deployment glue code) are the bread-and-butter use of bash in DevOps — small, focused scripts that wrap a sequence of commands you\'d otherwise type by hand repeatedly.',
              commands: ['#!/bin/bash', 'name="production"', 'echo "Deploying to $name"', 'today=$(date +%F)   # command substitution'],
              mistakes: ['Writing `name = "value"` with spaces — bash interprets this as running a command called `name` with arguments, not an assignment.', 'Leaving variables unquoted in commands, causing failures when the value contains spaces or special characters.'],
              interview: ['Be ready to explain the difference between `$var` and `"$var"` in a script, and why quoting matters.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which of the following bash statements are valid variable assignments?', options: [
                  { id: 'a', text: 'name="production"' },
                  { id: 'b', text: 'name = "production"' },
                  { id: 'c', text: 'count=5' },
                  { id: 'd', text: 'today=$(date +%F)' },
                ], correct: ['a', 'c', 'd'], explanation: 'Spaces around = are not allowed in bash assignments — `name = "production"` is interpreted as running a command.' },
                { id: 'q2', text: 'Why should variables generally be quoted (e.g. "$var") in bash scripts?', options: [
                  { id: 'a', text: 'To prevent unwanted word splitting on spaces inside the value' },
                  { id: 'b', text: 'To prevent unwanted glob/wildcard expansion' },
                  { id: 'c', text: 'Quoting is required for bash to parse the script at all' },
                  { id: 'd', text: 'To make the script run faster' },
                ], correct: ['a', 'b'], explanation: 'Quoting prevents word-splitting and globbing side effects — it has no effect on script parsing validity or execution speed.' },
              ]}
            },
            {
              id: 'bash-conditions-loops', title: 'Conditions & Loops', estMinutes: 14,
              objectives: ['Write if/elif/else logic in bash.', 'Write for and while loops over lists and command output.'],
              lesson: [
                'Bash conditionals use `if [ condition ]; then ... elif ...; else ...; fi`. The modern preferred test syntax is double brackets `[[ ]]`, which supports more operators (like `&&`, `||`, and pattern matching) and avoids some classic quoting pitfalls of the single-bracket `[ ]` (which is actually the `test` command in disguise).',
                'Loops come in two common flavors for DevOps scripting: `for item in list; do ... done` for iterating a known set (files, arguments, command output), and `while condition; do ... done` for repeating until a condition changes — commonly used for polling ("wait until this service responds") patterns.'
              ],
              keyConcepts: ['[[ ]] vs [ ] test syntax', 'for ... in loops', 'while loops for polling patterns', 'Exit status ($?) drives conditionals'],
              practical: 'A deployment script polling "is the new container healthy yet?" in a while loop with a timeout is one of the most common real patterns you\'ll write — and one of the most common places engineers forget to add a timeout, causing scripts to hang forever in CI.',
              commands: ['if [[ -f "$file" ]]; then echo "exists"; fi', 'for f in *.log; do echo "$f"; done', 'while ! curl -sf http://localhost:8080/health; do sleep 2; done'],
              mistakes: ['Writing polling loops with no timeout or retry limit, causing CI pipelines to hang indefinitely on a failure.', 'Using single brackets `[ ]` with unquoted variables, causing "unary operator expected" errors when the variable is empty.'],
              interview: ['Be able to explain what `$?` represents and how it drives conditional logic in bash.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements about bash conditionals and loops are correct?', options: [
                  { id: 'a', text: '[[ ]] supports pattern matching and is generally safer than [ ]' },
                  { id: 'b', text: 'A while loop can be used to poll for a condition until it becomes true' },
                  { id: 'c', text: '$? holds the exit status of the last executed command' },
                  { id: 'd', text: 'for loops in bash cannot iterate over command output' },
                ], correct: ['a', 'b', 'c'], explanation: 'for loops absolutely can iterate over command output, e.g. `for f in $(ls *.log)`.' },
                { id: 'q2', text: 'What is the main risk of a polling while-loop without a timeout in a CI deployment script?', options: [
                  { id: 'a', text: 'It can hang the pipeline indefinitely if the condition never becomes true' },
                  { id: 'b', text: 'It will always exit successfully regardless of outcome' },
                  { id: 'c', text: 'It consumes unbounded CI minutes/cost while waiting' },
                  { id: 'd', text: 'Bash does not support while loops in scripts' },
                ], correct: ['a', 'c'], explanation: 'Bash fully supports while loops in scripts; the real danger is an unbounded wait, not incorrect success reporting.' },
              ]}
            },
            {
              id: 'bash-functions-args', title: 'Functions & Arguments', estMinutes: 12,
              objectives: ['Define and call bash functions.', 'Access script arguments ($1, $@, $#).'],
              lesson: [
                'Bash functions group reusable logic: `function name() { ... }` or simply `name() { ... }`. Functions receive their own positional parameters ($1, $2, ...) independent of the script\'s, and return a status via `return` (0–255, not arbitrary values) or by echoing output that the caller captures with command substitution.',
                'Script-level arguments are read the same way: `$1`, `$2` for individual positional args, `$@` for all arguments as separate words, `$#` for the argument count, and `$0` for the script\'s own name — essential for writing scripts that behave like proper CLI tools.'
              ],
              keyConcepts: ['function name() { ... }', '$1, $2, $@, $#, $0', 'return vs echo for "returning" values', 'Local variables with `local`'],
              practical: 'A deploy.sh script that accepts an environment name as its first argument (`./deploy.sh staging`) and validates it against an allowed list before proceeding is a standard, safe pattern for any script that could otherwise deploy to the wrong environment by typo.',
              commands: ['deploy() {\n  local env="$1"\n  echo "Deploying to $env"\n}\ndeploy "$1"', 'echo "Args: $#, all: $@"'],
              mistakes: ['Forgetting `local` inside functions, causing variables to leak into and overwrite the global script scope.', 'Assuming `return` can pass back arbitrary data — it only returns a numeric exit status (0–255).'],
              interview: ['Be able to explain the difference between $@ and $# and when you\'d use each.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements about bash functions and arguments are correct?', options: [
                  { id: 'a', text: '$# holds the number of arguments passed to a script or function' },
                  { id: 'b', text: 'return can pass back any string value from a function' },
                  { id: 'c', text: 'local restricts a variable\'s scope to the current function' },
                  { id: 'd', text: '$1 refers to the first positional argument' },
                ], correct: ['a', 'c', 'd'], explanation: 'return only supports numeric exit statuses (0-255); use echo + command substitution to return string data.' },
              ]}
            },
            {
              id: 'bash-automation', title: 'Automation Scripts, Exit Codes & Pipes', estMinutes: 14,
              objectives: ['Use exit codes to signal script success/failure correctly.', 'Combine commands using pipes and redirection.'],
              lesson: [
                'Every command returns an exit code: 0 for success, non-zero for failure (the specific non-zero value can carry meaning, e.g. 1 for a generic error, 127 for "command not found"). Well-written automation scripts explicitly `exit 1` (or another non-zero code) on failure paths — CI/CD systems and calling scripts rely entirely on this exit code to decide whether a step succeeded, not on the text output.',
                'Pipes (`|`) chain the stdout of one command into the stdin of the next, letting you compose small tools into larger pipelines. Redirection (`>`, `>>`, `2>`, `2>&1`) controls where stdout and stderr go — to a file, appended to a file, or merged together — which is essential for logging automation output correctly.'
              ],
              keyConcepts: ['Exit codes: 0 = success, non-zero = failure', 'Pipes (|) chain stdout to stdin', 'Redirection: >, >>, 2>, 2>&1', 'set -e / set -euo pipefail for safer scripts'],
              practical: 'The single highest-leverage habit in production bash scripts is `set -euo pipefail` at the top: it stops the script immediately on any unhandled error, on use of an undefined variable, or on a failure anywhere inside a pipeline — without it, scripts silently continue past failures and can cause much worse damage downstream.',
              commands: ['#!/bin/bash\nset -euo pipefail', 'grep ERROR app.log | sort | uniq -c', 'command > out.log 2>&1   # merge stdout and stderr into one file', 'command || exit 1        # exit non-zero if command fails'],
              mistakes: ['Never checking exit codes in a deploy script, letting a failed step continue as if it succeeded.', 'Omitting `set -e`/`set -euo pipefail`, which is the single most common cause of "silent failure" bugs in production automation.'],
              interview: ['Be ready to explain what `set -euo pipefail` does and why it\'s considered a best practice.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements about exit codes and automation scripts are correct?', options: [
                  { id: 'a', text: 'An exit code of 0 conventionally means success' },
                  { id: 'b', text: 'CI/CD systems typically use a step\'s exit code to determine pass/fail' },
                  { id: 'c', text: 'set -e causes a script to exit immediately when a command fails' },
                  { id: 'd', text: 'Exit codes are optional and rarely checked by tooling' },
                ], correct: ['a', 'b', 'c'], explanation: 'Exit codes are the primary mechanism nearly all automation tooling relies on to detect success or failure.' },
                { id: 'q2', text: 'What does `set -euo pipefail` protect against?', options: [
                  { id: 'a', text: 'The script silently continuing after an unhandled command failure' },
                  { id: 'b', text: 'Using an undefined variable without error' },
                  { id: 'c', text: 'A failure inside any stage of a pipeline being ignored' },
                  { id: 'd', text: 'Syntax errors in the script' },
                ], correct: ['a', 'b', 'c'], explanation: 'It does not catch syntax errors (those fail at parse time regardless) — it changes runtime error-handling behavior.' },
              ]}
            },
          ]
        },
      ]
    },

    // ============================================================
    // 2. NETWORKING
    // ============================================================
    {
      id: 'networking', name: 'Networking', tagline: 'How everything you deploy actually talks to everything else.',
      units: [
        { id: 'net-fundamentals', name: 'Networking Fundamentals', developed: false, lectures: ['Networking Fundamentals', 'OSI Model', 'TCP/IP', 'IPv4', 'CIDR', 'Subnetting', 'Public vs Private IP'] },
        { id: 'net-services', name: 'Core Services', developed: false, lectures: ['DNS', 'DHCP', 'TCP vs UDP', 'Ports', 'Routing', 'NAT'] },
        { id: 'net-security', name: 'Security & Delivery', developed: false, lectures: ['Firewalls', 'Load Balancing', 'Proxy', 'VPN', 'Network Troubleshooting'] },
      ]
    },

    // ============================================================
    // 3. GIT & GITHUB
    // ============================================================
    {
      id: 'git', name: 'Git & GitHub', tagline: 'Version control is the ledger every DevOps workflow is built on.',
      units: [
        {
          id: 'git-core', name: 'Git & GitHub Core', developed: true,
          lectures: [
            {
              id: 'git-basics', title: 'Repositories, Staging & Commits', estMinutes: 14,
              objectives: ['Explain the working tree, staging area, and repository as three distinct states.', 'Create commits with meaningful history.'],
              lesson: [
                'Git tracks a project through three areas: the working tree (your actual files, as you edit them), the staging area / index (a preparation zone where you choose exactly which changes will go into the next commit), and the repository (the permanent, committed history). This three-stage model is what makes Git commits deliberate rather than automatic — `git add` moves changes from working tree to staging, and `git commit` moves staged changes into permanent history.',
                'A commit is a snapshot, not a diff, though Git displays it as a diff for convenience — internally, each commit points to a full tree of file contents plus a pointer to its parent commit(s), which is what makes the entire history a directed graph rather than a flat list.'
              ],
              keyConcepts: ['Working tree vs staging area vs repository', 'git add / git commit as two distinct steps', 'Commits as snapshots, addressed by SHA'],
              practical: 'Using `git add -p` to stage only part of your changes lets you split unrelated edits into focused, reviewable commits — a habit senior engineers rely on heavily during code review.',
              commands: ['git status', 'git add -p', 'git commit -m "feat: add health check endpoint"', 'git log --oneline --graph'],
              mistakes: ['Writing vague commit messages like "fix stuff" that provide no context for future debugging (e.g. via `git blame`).', 'Committing large unrelated changes together, making it impossible to revert one piece without reverting the whole commit.'],
              interview: ['Be ready to explain the three-stage model (working tree / staging / repository) clearly and concisely — it\'s one of the most common Git fundamentals questions.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements correctly describe Git\'s three-stage model?', options: [
                  { id: 'a', text: 'The working tree is where you directly edit files' },
                  { id: 'b', text: 'git add moves changes from the staging area into the repository' },
                  { id: 'c', text: 'The staging area lets you choose exactly what goes into the next commit' },
                  { id: 'd', text: 'git commit records staged changes permanently into history' },
                ], correct: ['a', 'c', 'd'], explanation: 'git add moves changes from the working tree INTO staging, not from staging into the repository — that\'s what commit does.' },
                { id: 'q2', text: 'Why might an engineer use `git add -p` instead of `git add .`?', options: [
                  { id: 'a', text: 'To review and stage changes hunk-by-hunk for cleaner, focused commits' },
                  { id: 'b', text: 'Because git add . is not a valid command' },
                  { id: 'c', text: 'To avoid accidentally committing unrelated changes together' },
                  { id: 'd', text: 'It stages files faster than git add .' },
                ], correct: ['a', 'c'], explanation: 'git add . is entirely valid; -p is about precision and commit hygiene, not speed.' },
              ]}
            },
            {
              id: 'git-branch-merge', title: 'Branches, Merge & Rebase', estMinutes: 16,
              objectives: ['Create and switch branches to isolate work.', 'Explain the difference between merge and rebase.', 'Resolve a merge conflict.'],
              lesson: [
                'A branch is simply a movable pointer to a commit — creating one is nearly instantaneous and cheap, which is why Git workflows encourage branching freely for every feature or fix rather than working directly on a shared main line.',
                'Merging combines two branches\' histories by creating a new "merge commit" with two parents, preserving the exact history of both branches. Rebasing instead replays your branch\'s commits on top of another branch\'s latest state, producing a linear history with no merge commit — cleaner to read, but it rewrites commit hashes, which is why you should never rebase commits that have already been pushed and shared with others.',
                'A merge conflict happens when Git cannot automatically reconcile changes to the same lines of a file across two histories being combined — resolving it means manually editing the conflicted file to the intended final state, then staging and completing the merge or rebase.'
              ],
              keyConcepts: ['Branch = pointer to a commit', 'Merge preserves both histories via a merge commit', 'Rebase replays commits for a linear history', 'Never rebase shared/pushed history'],
              practical: 'Many teams standardize on "feature branches merged via pull request, rebased locally before opening the PR" — giving clean, linear history on main while still preserving full traceability of who reviewed what.',
              commands: ['git checkout -b feature/health-check', 'git merge feature/health-check', 'git rebase main', 'git status   # shows conflicted files during a conflict'],
              mistakes: ['Rebasing a branch that others have already pulled and built work on top of — this rewrites history out from under them and causes painful divergence.', 'Panicking during a merge conflict instead of methodically reading the conflict markers (<<<<<<<, =======, >>>>>>>) and resolving them one at a time.'],
              interview: ['Be ready to explain merge vs. rebase clearly, including the specific risk of rebasing shared history — this is one of the most frequently asked Git interview questions.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements correctly distinguish merge from rebase?', options: [
                  { id: 'a', text: 'Merge creates a new commit with two parents' },
                  { id: 'b', text: 'Rebase produces a linear history by replaying commits' },
                  { id: 'c', text: 'Rebase preserves the original commit hashes' },
                  { id: 'd', text: 'Merge preserves the full branching history' },
                ], correct: ['a', 'b', 'd'], explanation: 'Rebase rewrites commits onto a new base, which changes their hashes — it does not preserve the originals.' },
                { id: 'q2', text: 'Why is rebasing already-pushed, shared commits considered dangerous?', options: [
                  { id: 'a', text: 'It rewrites commit history that others may have already built work on top of' },
                  { id: 'b', text: 'It permanently deletes the repository' },
                  { id: 'c', text: 'It can cause painful history divergence for collaborators' },
                  { id: 'd', text: 'Git physically prevents rebasing shared branches' },
                ], correct: ['a', 'c'], explanation: 'Git does not prevent it technically — it\'s a social/workflow risk, not a hard technical block, and it certainly doesn\'t delete the repo.' },
              ]}
            },
            {
              id: 'git-remote-github', title: 'Remotes, GitHub & Pull Requests', estMinutes: 14,
              objectives: ['Explain the relationship between a local repo and a remote like GitHub.', 'Describe the pull request review workflow.'],
              lesson: [
                'A "remote" is just a named reference to another copy of the repository, typically hosted on a service like GitHub. `git push` sends your local commits to the remote; `git pull` fetches and merges (or rebases) remote changes into your local branch. GitHub itself adds no new Git concepts — it\'s a hosting and collaboration layer on top of standard Git.',
                'A pull request (PR) is GitHub\'s mechanism for proposing that changes on one branch be merged into another, with room for code review, automated CI checks, and discussion before the merge happens. This review gate is what turns raw Git branching into a controlled collaboration workflow.'
              ],
              keyConcepts: ['origin as the default remote name', 'push / pull / fetch', 'Pull requests as a review + merge gate', 'CI checks gating PR merges'],
              practical: 'Branch protection rules on GitHub (requiring passing CI and at least one approval before merge) are what actually enforce your team\'s workflow — without them, a PR is just a suggestion anyone can bypass.',
              commands: ['git remote -v', 'git push origin feature/health-check', 'git fetch origin && git log origin/main..HEAD'],
              mistakes: ['Confusing `git fetch` (downloads remote changes without merging) with `git pull` (fetch + merge/rebase automatically) — using pull blindly can create unexpected merge commits.'],
              interview: ['Be able to explain the difference between fetch and pull precisely — a very common Git interview distinction.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements about Git remotes and GitHub are correct?', options: [
                  { id: 'a', text: 'git fetch downloads changes without merging them into your branch' },
                  { id: 'b', text: 'git pull is roughly equivalent to fetch followed by merge (or rebase)' },
                  { id: 'c', text: 'GitHub introduces entirely new Git commands not available locally' },
                  { id: 'd', text: 'A pull request enables review before merging changes' },
                ], correct: ['a', 'b', 'd'], explanation: 'GitHub is a hosting/collaboration layer on top of standard Git — it does not add new core Git commands.' },
              ]}
            },
            {
              id: 'git-workflow-actions', title: 'Git Workflow, GitHub Actions Intro & Best Practices', estMinutes: 14,
              objectives: ['Describe a standard trunk-based or Git-flow style branching workflow.', 'Explain, at a conceptual level, what GitHub Actions automates.'],
              lesson: [
                'Most modern teams use some variant of trunk-based development: a single long-lived `main` branch, short-lived feature branches merged in frequently via reviewed PRs, and releases tagged directly off main. This minimizes long-lived divergence and merge pain compared to older heavyweight branching models with permanent `develop`/`release` branches.',
                'GitHub Actions is GitHub\'s built-in automation engine: YAML-defined workflows triggered by repository events (a push, a PR, a schedule) that run jobs — such as running tests, building artifacts, or deploying — directly tied to your Git history. It\'s the most common way a commit or PR automatically triggers CI in a GitHub-hosted project, and it\'s covered in depth in the CI/CD category.'
              ],
              keyConcepts: ['Trunk-based development vs. long-lived branch models', 'Descriptive branch naming and small, focused PRs', 'GitHub Actions as event-driven automation'],
              practical: 'A clean commit message convention (like Conventional Commits: `feat:`, `fix:`, `chore:`) combined with small, focused PRs is one of the highest-leverage habits for keeping a fast-moving codebase reviewable and its history genuinely useful during incident debugging.',
              commands: ['git log --pretty=format:"%h %s" -10', 'git tag v1.4.0 && git push origin v1.4.0'],
              mistakes: ['Letting feature branches live for weeks without merging, guaranteeing a painful conflict-heavy merge later.', 'Writing PRs that bundle multiple unrelated features, making review slow and rollback risky.'],
              interview: ['Be ready to describe your preferred branching strategy and justify it — expect follow-up questions about how it handles hotfixes and releases.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements about modern Git workflows and GitHub Actions are correct?', options: [
                  { id: 'a', text: 'Trunk-based development favors short-lived feature branches merged frequently' },
                  { id: 'b', text: 'GitHub Actions workflows are defined in YAML and triggered by repo events' },
                  { id: 'c', text: 'Long-lived feature branches typically reduce merge conflicts' },
                  { id: 'd', text: 'Small, focused pull requests are generally easier to review than large ones' },
                ], correct: ['a', 'b', 'd'], explanation: 'Long-lived branches tend to increase merge conflict risk, not reduce it, since divergence from main grows over time.' },
              ]}
            },
          ]
        }
      ]
    },

    // ============================================================
    // 4. PYTHON FOR DEVOPS
    // ============================================================
    {
      id: 'python', name: 'Python for DevOps', tagline: 'Automation glue: scripts, APIs, and AWS via boto3.',
      units: [
        { id: 'py-fundamentals', name: 'Python Fundamentals', developed: false, lectures: ['Python Fundamentals', 'Variables', 'Data Types', 'Conditions', 'Loops', 'Functions', 'Lists', 'Dictionaries', 'Files', 'Exceptions', 'Modules'] },
        { id: 'py-automation', name: 'Automation & Cloud', developed: false, lectures: ['JSON', 'YAML', 'APIs', 'Requests', 'Boto3', 'AWS Automation'] },
      ]
    },

    // ============================================================
    // 5. DOCKER
    // ============================================================
    {
      id: 'docker', name: 'Docker', tagline: 'Package once, run identically everywhere.',
      units: [
        {
          id: 'docker-core', name: 'Docker Core', developed: true,
          lectures: [
            {
              id: 'docker-containers-vs-vm', title: 'Containers vs. Virtual Machines & Architecture', estMinutes: 14,
              objectives: ['Explain the architectural difference between containers and VMs.', 'Describe the role of the Docker daemon, CLI, and images.'],
              lesson: [
                'A virtual machine virtualizes hardware: a hypervisor runs multiple complete guest operating systems, each with its own kernel, on top of one physical (or virtual) machine. A container virtualizes the operating system instead: all containers on a host share that host\'s single kernel, and are isolated from each other using kernel features — namespaces (isolating what a process can see: PIDs, network, mounts) and cgroups (limiting what resources a process can use: CPU, memory).',
                'Because containers don\'t boot a separate kernel, they start in milliseconds and have far less overhead than VMs, at the cost of weaker isolation (a kernel-level vulnerability can potentially affect all containers on a host, whereas VMs are isolated at the hardware virtualization layer). Docker itself has three main pieces: the Docker daemon (`dockerd`, which does the actual work), the Docker CLI (`docker`, which you type commands into), and images (the packaged, layered filesystem + metadata that containers are instantiated from).'
              ],
              keyConcepts: ['Containers share the host kernel; VMs each run their own', 'Namespaces (isolation) and cgroups (resource limits)', 'Docker daemon vs CLI vs image vs container'],
              practical: 'This is why "it works on my machine" problems shrink dramatically with containers: the image bundles the exact runtime, libraries, and OS-level dependencies the application needs, decoupled from whatever is installed on the host.',
              commands: ['docker version', 'docker info', 'docker ps -a'],
              mistakes: ['Describing a container as "a lightweight VM" in an interview — it\'s architecturally a different mechanism (shared kernel + namespaces/cgroups), not a smaller virtual machine.'],
              interview: ['Be ready to explain namespaces and cgroups by name, not just "containers are isolated" — interviewers frequently probe for the actual kernel mechanism.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements correctly distinguish containers from virtual machines?', options: [
                  { id: 'a', text: 'Containers share the host operating system\'s kernel' },
                  { id: 'b', text: 'Each virtual machine typically runs its own full kernel' },
                  { id: 'c', text: 'Containers use namespaces and cgroups for isolation and resource limits' },
                  { id: 'd', text: 'Containers provide identical isolation strength to virtual machines' },
                ], correct: ['a', 'b', 'c'], explanation: 'Containers generally provide weaker isolation than VMs, since they share a kernel — that\'s a real architectural tradeoff, not a myth.' },
                { id: 'q2', text: 'Which Docker components are correctly described?', options: [
                  { id: 'a', text: 'dockerd is the daemon that performs container operations' },
                  { id: 'b', text: 'An image is a packaged, layered filesystem plus metadata' },
                  { id: 'c', text: 'The docker CLI directly manipulates containers without talking to a daemon' },
                  { id: 'd', text: 'A container is a running instance created from an image' },
                ], correct: ['a', 'b', 'd'], explanation: 'The CLI talks to the daemon (dockerd) via its API — it does not manipulate containers directly.' },
              ]}
            },
            {
              id: 'docker-images-dockerfile', title: 'Images & Dockerfile', estMinutes: 16,
              objectives: ['Write a basic Dockerfile.', 'Explain image layering and layer caching.'],
              lesson: [
                'A Dockerfile is a declarative recipe for building an image: each instruction (`FROM`, `RUN`, `COPY`, `WORKDIR`, `EXPOSE`, `CMD`, `ENTRYPOINT`, etc.) produces a new filesystem layer stacked on the previous one via overlayfs. Docker caches layers by instruction — if an earlier layer hasn\'t changed, Docker reuses the cached result instead of rebuilding it, which is why instruction *order* in a Dockerfile has a real, measurable effect on build speed.',
                'A well-known optimization: copy dependency manifests (like `package.json` or `requirements.txt`) and install dependencies *before* copying the rest of the application source. Since source code changes far more often than dependencies, this ordering means the expensive dependency-install layer stays cached across most builds, and only the cheap final "copy source" layer gets rebuilt.'
              ],
              keyConcepts: ['FROM, RUN, COPY, CMD, ENTRYPOINT, EXPOSE', 'Layer caching driven by instruction order', 'CMD vs ENTRYPOINT (default vs fixed command)'],
              practical: 'Ordering a Dockerfile as: base image → install OS deps → copy dependency manifest → install app dependencies → copy source → set CMD, is the standard pattern that maximizes cache reuse and minimizes rebuild time in CI.',
              commands: ['FROM node:20-slim', 'WORKDIR /app', 'COPY package*.json ./', 'RUN npm ci --omit=dev', 'COPY . .', 'CMD ["node", "server.js"]'],
              mistakes: ['Copying the entire application source before installing dependencies, invalidating the dependency-install cache layer on every single code change.', 'Confusing CMD (a default, overridable at `docker run` time) with ENTRYPOINT (fixed, harder to override) and using the wrong one for the situation.'],
              interview: ['Be ready to explain why Dockerfile instruction order affects build cache efficiency, with a concrete before/after example.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements about Dockerfiles and image layering are correct?', options: [
                  { id: 'a', text: 'Each instruction in a Dockerfile typically produces a new image layer' },
                  { id: 'b', text: 'Docker can reuse cached layers if earlier instructions haven\'t changed' },
                  { id: 'c', text: 'Instruction order in a Dockerfile has no effect on build speed' },
                  { id: 'd', text: 'Copying dependency manifests before application source can improve cache efficiency' },
                ], correct: ['a', 'b', 'd'], explanation: 'Instruction order absolutely affects build speed through cache invalidation — that\'s a core Docker optimization technique.' },
                { id: 'q2', text: 'Which statements correctly distinguish CMD from ENTRYPOINT?', options: [
                  { id: 'a', text: 'CMD provides a default command that can be overridden at `docker run` time' },
                  { id: 'b', text: 'ENTRYPOINT is generally harder to override than CMD' },
                  { id: 'c', text: 'A Dockerfile cannot use both CMD and ENTRYPOINT together' },
                  { id: 'd', text: 'CMD and ENTRYPOINT behave identically in all cases' },
                ], correct: ['a', 'b'], explanation: 'CMD and ENTRYPOINT can be combined (ENTRYPOINT as the fixed binary, CMD as default arguments) — they are not mutually exclusive, and they behave differently, not identically.' },
              ]}
            },
            {
              id: 'docker-volumes-networks', title: 'Volumes, Networks & Environment Variables', estMinutes: 14,
              objectives: ['Explain why containers need volumes for persistent data.', 'Describe Docker\'s default networking model.', 'Pass configuration into containers safely.'],
              lesson: [
                'A container\'s writable layer is ephemeral — deleting the container destroys any data written inside it. Volumes solve this by mounting storage that exists independently of any single container\'s lifecycle, either managed by Docker itself (named volumes) or a specific host path (bind mounts). Databases, uploaded files, and any state you can\'t afford to lose belong in a volume, never in the container\'s own writable layer.',
                'By default, Docker creates a bridge network per host, giving each container its own IP and allowing containers on the same network to reach each other by container name via Docker\'s built-in DNS — this is what lets a web container talk to a database container using just its service name, no hardcoded IPs required. Environment variables (`-e KEY=value` or an env file) are the standard way to inject configuration — like a database URL or feature flag — without baking it into the image itself, which is essential since the same image typically runs across dev, staging, and production with different config.'
              ],
              keyConcepts: ['Named volumes vs. bind mounts', 'Containers are ephemeral; data that must survive belongs in a volume', 'Default bridge network + container-name DNS resolution', 'Environment variables for runtime configuration'],
              practical: 'Never bake secrets (API keys, database passwords) directly into a Docker image via `ENV` in the Dockerfile — anyone who can pull or inspect the image can read them. Inject secrets at runtime via environment variables from a secrets manager, or mounted files, instead.',
              commands: ['docker volume create app-data', 'docker run -v app-data:/var/lib/data myapp', 'docker run -e DATABASE_URL="postgres://db:5432/app" myapp', 'docker network create app-net'],
              mistakes: ['Storing a database\'s data files inside the container\'s writable layer instead of a volume, guaranteeing data loss on container removal.', 'Hardcoding secrets into a Dockerfile with `ENV`, which then becomes permanently baked into the image layer history and visible to anyone who pulls it.'],
              interview: ['Be ready to explain, concretely, why "the container was deleted and we lost the database" happens and how volumes prevent it.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements about Docker volumes and networking are correct?', options: [
                  { id: 'a', text: 'A container\'s writable layer is lost when the container is removed' },
                  { id: 'b', text: 'Named volumes persist independently of any single container\'s lifecycle' },
                  { id: 'c', text: 'Containers on the same default bridge network cannot resolve each other by name' },
                  { id: 'd', text: 'Bind mounts map a specific host path into a container' },
                ], correct: ['a', 'b', 'd'], explanation: 'Docker\'s embedded DNS lets containers on the same user-defined network resolve each other by container/service name.' },
                { id: 'q2', text: 'Why is baking secrets into a Dockerfile with ENV considered a bad practice?', options: [
                  { id: 'a', text: 'The secret becomes permanently embedded in the image\'s layer history' },
                  { id: 'b', text: 'Anyone who can pull or inspect the image can potentially read the secret' },
                  { id: 'c', text: 'Docker images cannot contain environment variables at all' },
                  { id: 'd', text: 'It prevents the same image from running in multiple environments with different config' },
                ], correct: ['a', 'b', 'd'], explanation: 'Docker images absolutely can contain environment variables — the issue is that baking secrets in specifically makes them a permanent, exposed part of the image.' },
              ]}
            },
            {
              id: 'docker-compose', title: 'Docker Compose & Multi-Container Applications', estMinutes: 14,
              objectives: ['Describe what Docker Compose solves.', 'Read and reason about a docker-compose.yml file.'],
              lesson: [
                'Real applications are rarely a single container — a typical stack might need a web app, a database, and a cache, each needing correct networking, volumes, environment variables, and startup order. Running each with individual long `docker run` commands doesn\'t scale. Docker Compose lets you declare an entire multi-container application in one YAML file: services, their images or build contexts, networks, volumes, and environment variables, all started and stopped together with a single command.',
                'Compose automatically creates a shared network for all services in the file, so (just like the plain Docker networking case) services can reach each other by their service name as a hostname. `depends_on` controls startup *order* but — critically — does not wait for a dependency to be actually ready (e.g., a database accepting connections), only for its container process to have started, which is a very common source of "connection refused" errors in Compose stacks.'
              ],
              keyConcepts: ['docker-compose.yml declares multi-service apps', 'Shared network + service-name DNS resolution', 'depends_on controls start order, not readiness', 'docker compose up / down'],
              practical: 'A web app that depends_on a database still needs its own internal retry/wait logic on startup — relying on depends_on alone to guarantee the database is ready to accept connections is one of the most common Compose bugs teams hit in their first weeks using it.',
              commands: ['docker compose up -d', 'docker compose logs -f web', 'docker compose down -v   # also remove volumes'],
              mistakes: ['Assuming depends_on guarantees a dependency is fully ready, rather than just started.', 'Running `docker compose down -v` in a context where the volume held data that should have been kept.'],
              interview: ['Be ready to explain precisely what depends_on does and does not guarantee — this is a very common Compose gotcha interviewers probe for.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements about Docker Compose are correct?', options: [
                  { id: 'a', text: 'Compose lets you define a multi-container application in one YAML file' },
                  { id: 'b', text: 'depends_on guarantees a dependency is fully ready to accept connections' },
                  { id: 'c', text: 'Services in the same Compose file can typically reach each other by service name' },
                  { id: 'd', text: '`docker compose down -v` also removes the volumes defined in the file' },
                ], correct: ['a', 'c', 'd'], explanation: 'depends_on only controls startup order (that the container has started), not application-level readiness — this is a frequent source of bugs.' },
              ]}
            },
            {
              id: 'docker-registry-security', title: 'Registries, Image Optimization & Container Security', estMinutes: 16,
              objectives: ['Explain the role of a container registry like Docker Hub or ECR.', 'Apply basic image size and security optimizations.'],
              lesson: [
                'A container registry stores and distributes images by name and tag (e.g. `myapp:1.4.0`). Docker Hub is the default public registry; cloud providers offer their own private registries (AWS ECR, Google Artifact Registry) for storing proprietary images with access control. Pushing and pulling images is how images move from a build machine or CI pipeline to the servers or clusters that actually run them.',
                'Smaller images build faster, transfer faster, and — critically — present a smaller attack surface. Multi-stage builds (using multiple `FROM` statements in one Dockerfile, where only the final stage ships) let you compile or build in a full-featured stage and copy only the compiled artifact into a minimal final image, discarding build tools entirely from what ships to production. Running containers as a non-root user (`USER` instruction) and regularly scanning images for known vulnerable packages are two of the most impactful, low-effort container security practices available.'
              ],
              keyConcepts: ['Registry stores images by name:tag', 'Multi-stage builds separate build-time from run-time', 'Run as non-root with USER', 'Image scanning for known CVEs'],
              practical: 'A Go or Java service can often go from a 900MB image (with the full build toolchain baked in) to under 50MB using a multi-stage build — a real, measurable improvement to both deploy speed and attack surface, not just a cosmetic optimization.',
              commands: ['docker build -t myapp:1.4.0 .', 'docker tag myapp:1.4.0 <registry>/myapp:1.4.0', 'docker push <registry>/myapp:1.4.0', '# In Dockerfile: USER appuser   (after creating a non-root user)'],
              mistakes: ['Running every container as root by default, which is the Docker default unless explicitly overridden — this significantly widens the blast radius of a container compromise.', 'Never scanning images for known vulnerabilities before deploying them to production.'],
              interview: ['Be ready to explain what a multi-stage build is and why it improves both image size and security posture in one change.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements about container registries and image security are correct?', options: [
                  { id: 'a', text: 'Cloud providers offer private registries such as AWS ECR' },
                  { id: 'b', text: 'Multi-stage builds can exclude build tools from the final shipped image' },
                  { id: 'c', text: 'Containers run as root by default unless a Dockerfile specifies otherwise' },
                  { id: 'd', text: 'Image size has no relationship to security attack surface' },
                ], correct: ['a', 'b', 'c'], explanation: 'A smaller image generally ships fewer packages and tools, which directly reduces the attack surface available to an attacker.' },
              ]}
            },
          ]
        }
      ]
    },

    // ============================================================
    // 6. CI/CD
    // ============================================================
    {
      id: 'cicd', name: 'CI/CD', tagline: 'Ship changes safely, constantly, and without heroics.',
      units: [
        {
          id: 'cicd-core', name: 'CI/CD Core', developed: true,
          lectures: [
            {
              id: 'cicd-fundamentals', title: 'CI/CD Fundamentals', estMinutes: 14,
              objectives: ['Distinguish Continuous Integration, Continuous Delivery, and Continuous Deployment.', 'Describe the stages of a typical pipeline.'],
              lesson: [
                'Continuous Integration (CI) means every developer\'s changes are merged and automatically built and tested frequently — often on every push — to catch integration problems early, rather than during a painful "merge day." Continuous Delivery extends this by ensuring every change that passes CI is automatically packaged into a release-ready artifact, deployable at any time, though a human still triggers the actual production deployment. Continuous Deployment goes one step further: passing all automated checks triggers an *automatic* production deployment, with no manual approval gate at all.',
                'A typical pipeline has recognizable stages: build (compile/package the application), test (unit, integration, sometimes end-to-end), produce an artifact (a binary, a Docker image), and deploy it to one or more environments. Each stage acts as a gate — a failure at any stage stops the pipeline before a broken change reaches the next stage.'
              ],
              keyConcepts: ['CI: frequent automated build/test on integration', 'Continuous Delivery: always release-ready, manual deploy trigger', 'Continuous Deployment: fully automatic production deploy', 'Pipeline stages as sequential gates'],
              practical: 'Most real organizations run Continuous Delivery, not full Continuous Deployment — they want a human decision point before production changes, even though everything up to that point is fully automated.',
              commands: [],
              mistakes: ['Using "CI/CD" as one interchangeable term without being able to explain the specific difference between delivery and deployment — a very common gap interviewers probe for.'],
              interview: ['Be ready to state the precise difference between Continuous Delivery and Continuous Deployment in one sentence each — this exact question comes up constantly.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements correctly distinguish CI, Continuous Delivery, and Continuous Deployment?', options: [
                  { id: 'a', text: 'CI focuses on frequently and automatically building/testing integrated changes' },
                  { id: 'b', text: 'Continuous Delivery requires every passing change to auto-deploy to production with no approval' },
                  { id: 'c', text: 'Continuous Deployment removes the manual approval gate before production' },
                  { id: 'd', text: 'Continuous Delivery keeps every passing change release-ready, deployable on demand' },
                ], correct: ['a', 'c', 'd'], explanation: 'Continuous Delivery keeps changes release-ready but still requires a human to trigger the actual production deploy — that manual gate is exactly what distinguishes it from Continuous Deployment.' },
              ]}
            },
            {
              id: 'cicd-actions-secrets', title: 'GitHub Actions, Workflows & Secrets', estMinutes: 16,
              objectives: ['Read a basic GitHub Actions workflow file.', 'Explain how secrets should be handled in a pipeline.'],
              lesson: [
                'A GitHub Actions workflow is a YAML file under `.github/workflows/`, triggered by events (`on: push`, `on: pull_request`, a schedule, etc.), containing one or more jobs, each made of sequential steps that either run shell commands or invoke reusable "actions." Jobs run in isolated runner environments (fresh VMs or containers) by default, so nothing persists between runs unless explicitly cached or passed as an artifact.',
                'Secrets (API tokens, deploy keys, cloud credentials) must never be hardcoded into a workflow file, since that file is version-controlled and often visible to anyone with repo read access. GitHub Actions provides encrypted repository or environment secrets, injected into a job only at runtime as environment variables, and automatically redacted from logs if they happen to be printed.'
              ],
              keyConcepts: ['Workflow triggers: on: push, pull_request, schedule', 'Jobs run in isolated, ephemeral runners', 'Encrypted secrets injected at runtime, redacted from logs', 'Reusable actions vs raw shell steps'],
              practical: 'Environment-scoped secrets (e.g., a production deploy key only available to the "production" environment, requiring manual approval to run) are how teams enforce that only intentional, reviewed deployments can access the most sensitive credentials.',
              commands: ['# .github/workflows/ci.yml\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm test'],
              mistakes: ['Hardcoding an API key or password directly in a workflow YAML file instead of using encrypted secrets.', 'Assuming state (like installed dependencies) persists between separate workflow runs without explicit caching.'],
              interview: ['Be ready to explain exactly how GitHub Actions keeps secrets out of logs and why that matters for a shared, version-controlled workflow file.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements about GitHub Actions workflows and secrets are correct?', options: [
                  { id: 'a', text: 'Workflow files are typically stored under .github/workflows/' },
                  { id: 'b', text: 'Secrets should be hardcoded directly into the workflow YAML for simplicity' },
                  { id: 'c', text: 'Runners are generally ephemeral, fresh environments per run' },
                  { id: 'd', text: 'GitHub Actions can redact known secret values from workflow logs' },
                ], correct: ['a', 'c', 'd'], explanation: 'Hardcoding secrets into a version-controlled YAML file is exactly the practice encrypted secrets exist to prevent.' },
              ]}
            },
            {
              id: 'cicd-deployment-strategies', title: 'Deployment Strategies & Rollback', estMinutes: 16,
              objectives: ['Compare rolling, blue-green, and canary deployment strategies.', 'Explain what a rollback requires to be fast and safe.'],
              lesson: [
                'A rolling deployment replaces old instances with new ones gradually, a few at a time, keeping the service available throughout — simple and resource-efficient, but a bad release is exposed to some real traffic before it\'s fully rolled out. Blue-green deployment runs two complete environments ("blue" = current, "green" = new); traffic is switched all at once (or gradually) from blue to green after green is verified healthy, making rollback as simple as switching traffic back — at the cost of running double the infrastructure during the switch. Canary deployment routes a small percentage of real traffic to the new version first, watching error rates and key metrics before gradually increasing that percentage — catching bad releases with minimal blast radius, at the cost of added routing and monitoring complexity.',
                'A fast, safe rollback depends on more than just "redeploy the old version" — it requires that database migrations are backward-compatible (or reversible), that the old and new versions of the application can safely coexist during the transition, and that you actually know, at any moment, which version is the last known-good one. Rollback capability has to be designed in *before* an incident, not improvised during one.'
              ],
              keyConcepts: ['Rolling: gradual replacement, simplest, exposes some traffic to bad releases', 'Blue-green: instant traffic switch, needs double infrastructure', 'Canary: small traffic slice first, needs strong monitoring', 'Backward-compatible migrations are a rollback prerequisite'],
              practical: 'Database schema changes are the single most common reason a "simple rollback" turns into an incident: rolling back application code while a non-backward-compatible migration has already run against production data can break both the new and old versions simultaneously.',
              commands: [],
              mistakes: ['Treating "we can just redeploy the previous image" as a complete rollback plan without considering database migration compatibility.', 'Choosing blue-green for a stateful service without a clear plan for how in-flight sessions or long-running connections transition between environments.'],
              interview: ['Be ready to compare rolling, blue-green, and canary deployments and state a concrete tradeoff for each, not just a definition.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements about deployment strategies are correct?', options: [
                  { id: 'a', text: 'Rolling deployments replace instances gradually while staying available' },
                  { id: 'b', text: 'Blue-green deployments require running two full environments during the switch' },
                  { id: 'c', text: 'Canary deployments route all traffic to the new version immediately' },
                  { id: 'd', text: 'Canary deployments aim to limit the blast radius of a bad release' },
                ], correct: ['a', 'b', 'd'], explanation: 'Canary deployments specifically route only a small slice of traffic to the new version first — routing all traffic immediately would defeat the purpose.' },
                { id: 'q2', text: 'Why can a database migration undermine an otherwise simple rollback plan?', options: [
                  { id: 'a', text: 'A non-backward-compatible migration can break the old application version once rolled back' },
                  { id: 'b', text: 'Database migrations are always automatically reversible' },
                  { id: 'c', text: 'The old and new app versions may not both function correctly against the changed schema' },
                  { id: 'd', text: 'Rollback plans should account for schema compatibility before an incident happens' },
                ], correct: ['a', 'c', 'd'], explanation: 'Migrations are not automatically reversible — reversibility has to be deliberately designed, which is exactly the point.' },
              ]}
            },
            {
              id: 'cicd-security', title: 'Pipeline Security', estMinutes: 12,
              objectives: ['Identify common CI/CD pipeline security risks.', 'Explain the principle of least privilege as applied to pipeline credentials.'],
              lesson: [
                'A CI/CD pipeline is itself a high-value attack target: it typically holds credentials to deploy to production, pull private packages, and push container images, and it automatically executes code from every pull request. A pipeline that runs untrusted PR code with the same privileged secrets as a trusted main-branch build is a common, serious vulnerability — a malicious PR could exfiltrate production credentials simply by having CI run its code.',
                'Least privilege is the guiding principle: each pipeline job should hold only the credentials it actually needs for that specific stage, scoped as narrowly as possible (short-lived tokens over long-lived static keys where supported), and untrusted code (e.g., from external contributors\' PRs) should run with reduced or no access to secrets at all, often in a separate, restricted workflow.'
              ],
              keyConcepts: ['Pipelines hold high-value credentials — treat them as a real attack surface', 'Never run untrusted PR code with privileged secrets', 'Least privilege: scope credentials per-job, prefer short-lived tokens'],
              practical: 'A well-known real-world pattern is separating "build and test" (runs on every PR, no privileged secrets) from "deploy" (runs only on merges to main, with scoped deploy credentials) into distinct workflow triggers — so an untrusted PR simply never has the opportunity to touch production credentials.',
              commands: [],
              mistakes: ['Giving a CI service account broad, long-lived cloud admin credentials "to avoid permission headaches," rather than scoping them tightly to what each job actually needs.'],
              interview: ['Be ready to explain, with a concrete example, why running PR code from external contributors with full production secrets is dangerous.'],
              quiz: { passScore: 80, questions: [
                { id: 'q1', text: 'Which statements about CI/CD pipeline security are correct?', options: [
                  { id: 'a', text: 'Pipelines are a high-value target because they often hold deployment credentials' },
                  { id: 'b', text: 'Running untrusted pull request code with privileged secrets is a common serious vulnerability' },
                  { id: 'c', text: 'Least privilege means giving every job broad access to avoid permission issues' },
                  { id: 'd', text: 'Separating build/test workflows from deploy workflows can limit exposure of production credentials' },
                ], correct: ['a', 'b', 'd'], explanation: 'Least privilege means the opposite — scoping each job to the minimum access it needs, not granting broad access for convenience.' },
              ]}
            },
          ]
        }
      ]
    },

    // ============================================================
    // 7. TERRAFORM
    // ============================================================
    {
      id: 'terraform', name: 'Terraform', tagline: 'Infrastructure as Code, declared and versioned like software.',
      units: [
        { id: 'tf-core', name: 'Terraform Core', developed: false, lectures: ['Infrastructure as Code', 'Terraform Fundamentals', 'Providers', 'Resources', 'Variables', 'Outputs', 'Data Sources'] },
        { id: 'tf-advanced', name: 'State & Modules', developed: false, lectures: ['Terraform State', 'Remote State', 'Modules', 'Dependencies', 'Lifecycle', 'Workspaces', 'Terraform Security', 'Terraform Best Practices'] },
      ]
    },

    // ============================================================
    // 8. ANSIBLE
    // ============================================================
    {
      id: 'ansible', name: 'Ansible', tagline: 'Agentless configuration management at scale.',
      units: [
        { id: 'ansible-core', name: 'Ansible Core', developed: false, lectures: ['Configuration Management', 'Ansible Architecture', 'Inventory', 'YAML', 'Modules', 'Ad-hoc Commands', 'Playbooks', 'Variables', 'Handlers', 'Templates', 'Roles', 'Ansible Vault', 'Secrets', 'Best Practices'] },
      ]
    },

    // ============================================================
    // 9. AWS FOR DEVOPS
    // ============================================================
    {
      id: 'aws', name: 'AWS for DevOps', tagline: 'DevOps-focused AWS — not a beginner cloud course.',
      units: [
        { id: 'aws-compute', name: 'Compute', developed: false, lectures: ['EC2', 'AMI', 'Instance Types', 'EBS', 'User Data', 'Security Groups', 'Auto Scaling Groups', 'Elastic Load Balancing', 'ECS', 'ECR', 'Fargate', 'Lambda'] },
        { id: 'aws-networking', name: 'Networking', developed: false, lectures: ['VPC', 'Subnets', 'Route Tables', 'Internet Gateway', 'NAT Gateway', 'Security Groups', 'NACL', 'VPC Peering', 'Transit Gateway', 'VPC Endpoints'] },
        { id: 'aws-storage', name: 'Storage', developed: false, lectures: ['S3', 'EBS', 'EFS'] },
        { id: 'aws-iam', name: 'IAM', developed: false, lectures: ['IAM Users', 'Groups', 'Roles', 'Policies', 'Least Privilege', 'STS'] },
        { id: 'aws-databases', name: 'Databases', developed: false, lectures: ['RDS', 'Aurora', 'DynamoDB Fundamentals'] },
        { id: 'aws-devops-services', name: 'DevOps Services', developed: false, lectures: ['CodeBuild', 'CodeDeploy', 'CodePipeline', 'CloudFormation', 'Systems Manager', 'Parameter Store', 'Secrets Manager'] },
        { id: 'aws-monitoring', name: 'Monitoring', developed: false, lectures: ['CloudWatch', 'CloudTrail', 'AWS Config'] },
      ]
    },

    // ============================================================
    // 10. KUBERNETES
    // ============================================================
    {
      id: 'kubernetes', name: 'Kubernetes', tagline: 'Orchestrating containers at production scale.',
      units: [
        { id: 'k8s-core', name: 'Core Concepts', developed: false, lectures: ['Kubernetes Fundamentals', 'Kubernetes Architecture', 'Cluster', 'Nodes', 'Pods', 'Deployments', 'ReplicaSets', 'Services', 'Namespaces'] },
        { id: 'k8s-config', name: 'Configuration & Networking', developed: false, lectures: ['ConfigMaps', 'Secrets', 'Volumes', 'Ingress', 'Resource Limits', 'Health Checks', 'Kubernetes Networking'] },
        { id: 'k8s-ops', name: 'Operations & AWS', developed: false, lectures: ['Rolling Updates', 'Scaling', 'Helm', 'Troubleshooting', 'EKS'] },
      ]
    },

    // ============================================================
    // 11. MONITORING & OBSERVABILITY
    // ============================================================
    {
      id: 'monitoring', name: 'Monitoring & Observability', tagline: 'Knowing what your systems are doing before your users tell you.',
      units: [
        { id: 'mon-core', name: 'Monitoring Fundamentals', developed: false, lectures: ['Monitoring Fundamentals', 'Metrics', 'Logs', 'Traces', 'CloudWatch', 'Prometheus', 'Grafana'] },
        { id: 'mon-ops', name: 'Alerting & Reliability', developed: false, lectures: ['Alerting', 'Dashboards', 'SLI', 'SLO', 'SLA', 'Incident Response', 'Troubleshooting'] },
      ]
    },

    // ============================================================
    // 12. DEVSECOPS
    // ============================================================
    {
      id: 'devsecops', name: 'DevSecOps', tagline: 'Security as a continuous part of the pipeline, not a final gate.',
      units: [
        { id: 'ds-core', name: 'DevSecOps Core', developed: false, lectures: ['DevSecOps Fundamentals', 'IAM', 'Secrets Management', 'Linux Hardening', 'Container Security', 'Image Scanning', 'Dependency Scanning', 'SAST', 'DAST', 'CI/CD Security', 'AWS Security', 'Least Privilege', 'Security Monitoring'] },
      ]
    },

    // ============================================================
    // 13. REAL DEVOPS CAPSTONE PROJECTS
    // ============================================================
    {
      id: 'capstone', name: 'Real DevOps Projects', tagline: 'Combine everything into production-style, multi-technology builds.',
      units: [
        { id: 'capstone-core', name: 'Capstone Track', developed: false, lectures: ['Production-Ready AWS Infrastructure', 'Containerized Application with Docker', 'CI/CD Pipeline', 'Infrastructure as Code with Terraform', 'Kubernetes Deployment', 'Monitoring & Observability', 'Final Capstone'] },
      ]
    },
  ]
};


/* ============================================================
   PROJECTS — mentor-style briefs only. No solutions, no commands
   that would hand the user the implementation.
   ============================================================ */
const PROJECTS = [
  {
    id: 'proj-linux-admin', categoryId: 'linux', unitName: 'Linux Fundamentals', title: 'Linux Server Administration',
    difficulty: 'Beginner', hours: '4-6 hours',
    objective: 'Provision and administer a Linux server well enough to confidently support any application running on it.',
    overview: 'Set up a fresh Linux VM (a cheap/free-tier cloud instance or a local VM) and bring it from a bare install to a properly administered, documented server — without a control panel or GUI, entirely over SSH.',
    requirements: [
      'Create at least two non-root users with different privilege levels, and disable direct root SSH login.',
      'Configure SSH key-based authentication and disable password authentication.',
      'Install and manage at least one long-running service using systemd (start, stop, enable on boot, check status).',
      'Set up basic log rotation for a service that writes logs.',
      'Document, in your own words, every command you ran and why.',
    ],
    technologies: ['Linux (any distro)', 'SSH', 'systemd'],
    expectedOutcome: 'A server you could hand to a teammate with a short README, where they could understand exactly who has access, how services are managed, and where to find logs.',
    constraints: ['No GUI tools or control panels (e.g. cPanel) — SSH and CLI only.', 'Do not disable the firewall entirely to "make things easier."'],
    advice: [
      'Before disabling root SSH login, confirm your non-root user can already successfully sudo — it is very easy to lock yourself out.',
      'Read the man page for whichever service you choose before configuring it; don\'t just copy a config from a tutorial without understanding each line.',
    ],
    successCriteria: ['You can SSH in as a non-privileged user and explain every permission and service configuration decision you made.', 'A service survives a reboot without manual intervention.'],
  },
  {
    id: 'proj-linux-perms', categoryId: 'linux', unitName: 'Linux Permissions', title: 'Linux Permission & Security Lab',
    difficulty: 'Intermediate', hours: '3-5 hours',
    objective: 'Design and implement a multi-team directory permission scheme that enforces least privilege without breaking collaboration.',
    overview: 'Simulate three teams (e.g. "backend", "frontend", "ops") sharing one server, each needing their own private space plus one genuinely shared space, without accidentally granting more access than intended.',
    requirements: [
      'Create groups and users representing at least three teams.',
      'Design a directory structure where each team has a private area no other team can read, plus one shared area all teams can read and write to safely.',
      'Use SGID appropriately so files created in the shared area get consistent group ownership automatically.',
      'Identify and correct at least one intentionally-introduced overly-permissive configuration (you decide what "wrong" looks like, then fix it and document why it was wrong).',
      'Audit the system for any unexpected SUID binaries and document your findings.',
    ],
    technologies: ['Linux', 'chmod/chown/chgrp', 'SUID/SGID', 'ACLs (optional)'],
    expectedOutcome: 'A documented permission model where you can explain, for any file, exactly who can access it and why — with no unnecessary broad permissions anywhere.',
    constraints: ['Do not use chmod 777 anywhere as a "fix."', 'Every access decision must be justified — no permission granted "just in case."'],
    advice: [
      'Draw the directory tree and intended access on paper before touching the terminal — permission bugs are far cheaper to catch on paper.',
      'Test as each user, not just as root — root can access everything regardless of permissions, which will hide real bugs.',
    ],
    successCriteria: ['Switching to any team\'s user account, you can demonstrate they can access exactly what they should and nothing more.', 'You can explain the SGID behavior on the shared directory without looking it up.'],
  },
  {
    id: 'proj-bash-automation', categoryId: 'linux', unitName: 'Bash Scripting', title: 'Bash Automation Project',
    difficulty: 'Intermediate', hours: '4-6 hours',
    objective: 'Build a real, reusable automation script that safely handles a repetitive operational task end-to-end.',
    overview: 'Pick one genuine repetitive task — log cleanup, backup rotation, or a health-check-and-alert script — and build it as a production-quality bash script, not a one-off snippet.',
    requirements: [
      'Accept configuration via command-line arguments (not hardcoded values).',
      'Use `set -euo pipefail` and handle failure paths explicitly with meaningful exit codes.',
      'Log its own actions somewhere reviewable (not just stdout that disappears).',
      'Include input validation — reject bad arguments with a clear error message rather than failing halfway through.',
      'Be idempotent: running it twice in a row should not cause errors or duplicate side effects.',
    ],
    technologies: ['Bash', 'cron or systemd timers (optional, for scheduling)'],
    expectedOutcome: 'A script a teammate could run with `--help`, understand immediately, and trust not to silently corrupt or lose data if run incorrectly.',
    constraints: ['No destructive operation (delete, overwrite) should run without either a confirmation step or a clearly documented --force flag.'],
    advice: [
      'Write the "what could go wrong" list before the "happy path" logic — most of the real engineering value in an automation script is in its failure handling.',
      'Test your script against edge cases: no arguments, wrong argument types, and running it when the target already doesn\'t exist.',
    ],
    successCriteria: ['Running the script with invalid input produces a clear, actionable error rather than a confusing crash.', 'Running it twice back-to-back produces the same safe result both times.'],
  },
  {
    id: 'proj-git-workflow', categoryId: 'git', unitName: 'Git & GitHub Core', title: 'Professional Git Workflow for a DevOps Project',
    difficulty: 'Beginner', hours: '3-4 hours',
    objective: 'Practice a realistic, review-gated Git workflow from first commit through a merged, tagged release.',
    overview: 'Take any small project (even a handful of scripts from earlier lectures) and run it through a full trunk-based workflow: feature branches, pull requests, and a tagged release — as if a teammate were reviewing your work.',
    requirements: [
      'Initialize a repository with a clear main branch and a meaningful first commit.',
      'Create at least three separate feature branches for three distinct, unrelated changes.',
      'Open pull requests for each (even without another human reviewer, write the PR description as if for one), and merge them using at least two different merge methods (e.g. a regular merge and a rebase-and-merge).',
      'Deliberately create and resolve one real merge conflict.',
      'Tag a release once main reflects all merged work.',
    ],
    technologies: ['Git', 'GitHub'],
    expectedOutcome: 'A repository whose commit history and PRs read clearly enough that someone unfamiliar with the project could reconstruct what happened and why, just from the history.',
    constraints: ['No direct commits to main — every change must go through a branch and PR.'],
    advice: [
      'Write your PR descriptions the way you\'d want to receive one: what changed, why, and how to verify it.',
      'When you hit the deliberate merge conflict, resist resolving it by discarding one side entirely — practice reading and merging the actual conflicting logic.',
    ],
    successCriteria: ['Your commit history is readable top to bottom without needing you to explain it verbally.', 'You can explain exactly why you chose a merge vs. rebase-and-merge for each PR.'],
  },
  {
    id: 'proj-docker-containerize', categoryId: 'docker', unitName: 'Docker Core', title: 'Containerize a Web Application',
    difficulty: 'Beginner', hours: '3-5 hours',
    objective: 'Take an existing (or simple self-written) web application and package it as a production-reasonable Docker image.',
    overview: 'Write a Dockerfile for a small web app (any language/framework you\'re comfortable with) that follows real-world image best practices, not just "make it run."',
    requirements: [
      'Use a multi-stage build if your language has a compile/build step.',
      'Run the final container as a non-root user.',
      'Keep the final image as small as reasonably possible — measure and report the size before and after your optimizations.',
      'Pass all runtime configuration via environment variables, with none hardcoded into the image.',
      'Include a working health check the container orchestrator (or you, manually) can use to verify the app is actually ready.',
    ],
    technologies: ['Docker', 'Any web framework'],
    expectedOutcome: 'An image that is small, runs as non-root, accepts configuration at runtime, and could be handed to another engineer with zero additional context.',
    constraints: ['Do not use the `latest` tag for your base image — pin a specific version.', 'Do not run as root in the final container.'],
    advice: [
      'Build the image, then run `docker history <image>` to see exactly which instruction added how much size — it often reveals surprising culprits.',
      'Try deliberately misconfiguring an environment variable and confirming the app fails with a clear error, not a silent crash.',
    ],
    successCriteria: ['`docker inspect` confirms the container runs as a non-root user.', 'You can explain, layer by layer, what contributes to your final image size.'],
  },
  {
    id: 'proj-docker-compose-multi', categoryId: 'docker', unitName: 'Docker Core', title: 'Multi-Container Application',
    difficulty: 'Intermediate', hours: '4-6 hours',
    objective: 'Compose a realistic multi-service application stack with correct networking, persistence, and startup ordering.',
    overview: 'Build a Compose stack with at least a web application, a database, and one supporting service (e.g. a cache), wired together the way a real small production stack would be.',
    requirements: [
      'Persist database data using a named volume, verified by restarting the stack and confirming data survives.',
      'Ensure the web application does not crash-loop if the database isn\'t immediately ready — implement your own readiness handling rather than relying solely on depends_on.',
      'Keep all secrets (DB passwords, etc.) out of the Compose file itself — use an env file excluded from version control.',
      'Document the full service topology (what talks to what, and how) in a short README.',
    ],
    technologies: ['Docker Compose', 'A database of your choice', 'A cache of your choice (e.g. Redis)'],
    expectedOutcome: 'A `docker compose up` that reliably brings up a correctly networked, persistent multi-service stack from a cold start, every time.',
    constraints: ['Do not commit real secrets or credentials to version control, even in a sample env file — use clearly fake placeholder values there.'],
    advice: [
      'Intentionally start the stack from a completely cold, empty state several times to catch startup-ordering assumptions that only fail occasionally.',
      'Read your application\'s own logs during a failed startup rather than assuming the cause — most "flaky" Compose stacks trace back to a specific, reproducible readiness issue.',
    ],
    successCriteria: ['The stack starts reliably from cold, every time, without manual retries.', 'Data survives a full `docker compose down` (without -v) and `up` cycle.'],
  },
  {
    id: 'proj-cicd-pipeline', categoryId: 'cicd', unitName: 'CI/CD Core', title: 'Build a Complete CI/CD Pipeline',
    difficulty: 'Advanced', hours: '6-10 hours',
    objective: 'Design and implement an end-to-end pipeline that takes a code change from a pull request to a deployed, running artifact.',
    overview: 'Wire together: GitHub → automated tests → build → Docker image → push to a registry → deployment, using GitHub Actions (or another CI system you prefer).',
    requirements: [
      'Tests must run automatically on every pull request, and merging should be blocked if they fail.',
      'The pipeline should build a Docker image only after tests pass, and tag it meaningfully (not just `latest`).',
      'Push the built image to a registry (Docker Hub or a cloud registry) using credentials stored as encrypted secrets, never hardcoded.',
      'Implement a deployment step that only runs on merges to your main branch, separate from the test/build workflow that runs on every PR.',
      'Add a manual approval gate before the deployment step (most CI systems support "environments" with required reviewers for exactly this).',
    ],
    technologies: ['GitHub Actions (or equivalent)', 'Docker', 'A container registry'],
    expectedOutcome: 'A pipeline where a teammate can open a PR, see tests run automatically, merge with confidence, and watch a deployment happen through a clear, auditable, approval-gated process.',
    constraints: ['Untrusted pull request code (e.g. from a fork) must never have access to your deployment secrets.', 'Do not skip the manual approval gate "to save time" — it is a required part of the exercise.'],
    advice: [
      'Build this in stages: first get tests running on every PR reliably, only then add image build, only then add deployment. Trying to build all three at once makes debugging painful.',
      'Deliberately break a test and confirm the pipeline actually blocks the merge before moving on — a CI pipeline that doesn\'t enforce its own gates is worse than none at all.',
    ],
    successCriteria: ['A failing test genuinely blocks merge — verified by testing it, not assumed.', 'You can trace, from a single commit, every stage it passed through to reach deployment.'],
  },
  {
    id: 'proj-network-design', categoryId: 'networking', unitName: 'Networking', title: 'Design a Multi-Subnet Production Network',
    difficulty: 'Intermediate', hours: '3-5 hours',
    objective: 'Design (on paper or diagram, then optionally implement in a cloud VPC) a network architecture with correctly segmented public and private subnets.',
    overview: 'Plan the network for a hypothetical three-tier application (web, application, database), correctly separating what should be internet-facing from what should not be.',
    requirements: [
      'Choose a CIDR block for the overall network and subdivide it into logically separated public and private subnets, showing your subnetting math.',
      'Decide which tier(s) genuinely need direct internet exposure, and justify why the others do not.',
      'Design how the private tiers reach the internet for outbound traffic (e.g. updates) without being directly reachable from it.',
      'Document your routing decisions: which subnet\'s traffic goes where, and why.',
    ],
    technologies: ['IP addressing / CIDR / subnetting', 'A cloud VPC (optional implementation)'],
    expectedOutcome: 'A network diagram and written justification that a security-conscious reviewer would approve without follow-up questions about unnecessary exposure.',
    constraints: ['The database tier must not be directly reachable from the public internet under any circumstance in your design.'],
    advice: [
      'Do the subnetting math by hand before reaching for a CIDR calculator — the goal is to genuinely understand it, not just produce a correct-looking answer.',
      'For every path you design, ask "does this component actually need to be reachable from the internet directly, or does it just need outbound access?" — the answer changes the design significantly.',
    ],
    successCriteria: ['You can justify every subnet boundary and every routing decision out loud, without hesitation.', 'No tier has more network exposure than its actual requirements justify.'],
  },
  {
    id: 'proj-python-aws-automation', categoryId: 'python', unitName: 'Python for DevOps', title: 'AWS Resource Automation Script',
    difficulty: 'Intermediate', hours: '4-6 hours',
    objective: 'Write a Python automation script using boto3 that performs a genuinely useful, safe operational task against AWS resources.',
    overview: 'Pick a real recurring AWS operations task — e.g. reporting all untagged resources, or finding and flagging stopped EC2 instances older than N days — and automate it with Python and boto3.',
    requirements: [
      'Use boto3 to read real resource data from at least one AWS service.',
      'Handle AWS API errors and pagination correctly — do not assume a single API call always returns every result.',
      'Produce a clear, structured report (console table, JSON, or CSV) rather than raw API dumps.',
      'Make the script read-only by default, with any destructive action requiring an explicit opt-in flag.',
    ],
    technologies: ['Python', 'boto3', 'AWS'],
    expectedOutcome: 'A script a teammate could run against a real AWS account to get immediate, trustworthy operational insight, without fear it might change something by accident.',
    constraints: ['The script must never perform a destructive action (terminate, delete) without an explicit, clearly-named opt-in flag.'],
    advice: [
      'Read the boto3 documentation for pagination on whichever API you use — many engineers ship scripts that silently only process the first page of results.',
      'Test against a throwaway or sandbox AWS account, never directly against a shared production account.',
    ],
    successCriteria: ['The script correctly handles an account with more resources than fit in a single API page.', 'Running it with no flags never modifies any AWS resource.'],
  },
  {
    id: 'proj-terraform-aws', categoryId: 'terraform', unitName: 'Terraform', title: 'AWS Infrastructure with Terraform',
    difficulty: 'Intermediate', hours: '5-8 hours',
    objective: 'Provision a small, real piece of AWS infrastructure using Terraform, with correctly managed state.',
    overview: 'Define a VPC with public/private subnets and a single EC2 instance entirely as Terraform code, applied and destroyed cleanly and repeatably.',
    requirements: [
      'Use variables for anything environment-specific (region, instance size, CIDR ranges) — no hardcoded values that would break in another environment.',
      'Configure remote state storage rather than leaving state as a local file.',
      'Use outputs to expose the values another engineer would actually need (e.g. the instance\'s IP).',
      'Ensure `terraform destroy` fully and cleanly removes everything you created, with no orphaned resources.',
    ],
    technologies: ['Terraform', 'AWS'],
    expectedOutcome: 'A Terraform configuration a teammate could clone, run `terraform apply` against their own AWS account, and get a working, documented environment.',
    constraints: ['Do not commit your Terraform state file to version control.', 'Do not hardcode AWS credentials anywhere in the configuration.'],
    advice: [
      'Run `terraform plan` and actually read the full output before every apply, especially early on — this is where you\'ll catch mistakes before they become real infrastructure.',
      'Deliberately destroy and reapply your infrastructure at least once to build confidence that your configuration is genuinely reproducible, not just a one-time success.',
    ],
    successCriteria: ['`terraform plan` shows no unexpected changes on a second run with no code changes (idempotency).', 'State is stored remotely, not as a local file you could accidentally lose.'],
  },
  {
    id: 'proj-ansible-config', categoryId: 'ansible', unitName: 'Ansible', title: 'Automated Linux Server Configuration',
    difficulty: 'Intermediate', hours: '4-6 hours',
    objective: 'Use Ansible to configure a server from a bare install to a defined, reproducible state — without manually SSHing in to make changes.',
    overview: 'Write an Ansible playbook that installs and configures a web server (or any service of your choice), manages its configuration file via a template, and ensures the service is running and enabled.',
    requirements: [
      'Define your target host(s) in an inventory file.',
      'Use a template (not a static copied file) for at least one configuration file, driven by variables.',
      'Use a handler so the service only restarts when its configuration actually changes.',
      'Store any sensitive variable (e.g. a password) using Ansible Vault, not in plaintext.',
      'Run the playbook twice in a row and confirm the second run reports no changes (true idempotency).',
    ],
    technologies: ['Ansible', 'YAML', 'Ansible Vault'],
    expectedOutcome: 'A playbook that could configure a brand-new server identically to your existing one, with zero manual steps.',
    constraints: ['No sensitive values may appear in plaintext anywhere in the repository.'],
    advice: [
      'Run playbooks against a disposable VM or container, never directly against a shared or production server while you\'re still learning.',
      'If a second run of your playbook reports changes when nothing should have changed, that\'s a real bug in your playbook\'s idempotency — investigate it rather than ignoring it.',
    ],
    successCriteria: ['A second consecutive run of the playbook reports zero changes.', 'No secret values are visible in plaintext anywhere in your repository.'],
  },
  {
    id: 'proj-aws-ha-webapp', categoryId: 'aws', unitName: 'AWS for DevOps', title: 'Highly Available Web Application on AWS',
    difficulty: 'Advanced', hours: '6-10 hours',
    objective: 'Architect and deploy a web application on AWS that survives the failure of any single instance without downtime.',
    overview: 'Design a solution combining an Auto Scaling Group across multiple availability zones behind a load balancer, so that no single instance failure takes the application down.',
    requirements: [
      'Deploy application instances across at least two availability zones.',
      'Configure a load balancer with a health check that actually reflects application health, not just "is the port open."',
      'Configure the Auto Scaling Group to replace an unhealthy instance automatically.',
      'Test your design by deliberately terminating an instance and observing recovery, end to end.',
      'Document your scaling policy and the reasoning behind its thresholds.',
    ],
    technologies: ['EC2', 'Auto Scaling Groups', 'Elastic Load Balancing', 'Security Groups'],
    expectedOutcome: 'An architecture that keeps serving traffic through a deliberate instance failure, with recovery you can demonstrate, not just claim.',
    constraints: ['Security groups should only allow the minimum required traffic — no wide-open inbound rules.'],
    advice: [
      'Design and test your health check endpoint carefully — a health check that always returns "healthy" defeats the entire purpose of the exercise.',
      'Actually terminate an instance to test failover. A design that "should" work is not the same as one you\'ve verified works.',
    ],
    successCriteria: ['The application keeps serving traffic during a deliberate instance termination, verified by you, live.', 'A replacement instance comes up automatically without manual intervention.'],
  },
  {
    id: 'proj-k8s-multiservice', categoryId: 'kubernetes', unitName: 'Kubernetes', title: 'Deploy a Multi-Service Application on Kubernetes',
    difficulty: 'Advanced', hours: '6-10 hours',
    objective: 'Deploy a multi-service application to a Kubernetes cluster with correct service discovery, configuration, and resilience.',
    overview: 'Take a multi-container application (e.g. from your Docker Compose project) and re-architect it as Kubernetes manifests: Deployments, Services, ConfigMaps, and Secrets.',
    requirements: [
      'Define resource requests and limits for every container — no container should run unbounded.',
      'Configure liveness and readiness probes that reflect genuine application health.',
      'Use ConfigMaps and Secrets for configuration instead of hardcoding values into manifests.',
      'Verify a rolling update of one service causes zero downtime for consumers of that service.',
      'Deliberately delete a pod and confirm Kubernetes replaces it automatically.',
    ],
    technologies: ['Kubernetes', 'kubectl', 'A local cluster (minikube/kind) or EKS'],
    expectedOutcome: 'A set of manifests that reliably deploys the full application stack with self-healing and safe rolling updates.',
    constraints: ['Secrets must not be committed to version control in plaintext.'],
    advice: [
      'Get one service fully working — deployed, probed, self-healing — before adding the second. Debugging multiple broken services simultaneously is much harder than it needs to be.',
      'Read the actual pod events (`kubectl describe pod`) rather than guessing when something doesn\'t come up healthy — the reason is almost always right there.',
    ],
    successCriteria: ['Deleting a pod results in an automatic, healthy replacement with no manual action.', 'A rolling update completes with zero failed requests to a continuously-polling health check.'],
  },
  {
    id: 'proj-monitoring-stack', categoryId: 'monitoring', unitName: 'Monitoring & Observability', title: 'Build a Monitoring & Alerting Environment',
    difficulty: 'Intermediate', hours: '5-7 hours',
    objective: 'Stand up a monitoring stack that collects real metrics from a running application and alerts on meaningful thresholds.',
    overview: 'Instrument an application (or a simple service you build for this purpose) to expose metrics, collect them, visualize them, and configure at least one genuinely useful alert.',
    requirements: [
      'Expose at least three meaningful application metrics (not just CPU/memory) — e.g. request rate, error rate, latency.',
      'Build a dashboard that a non-expert could glance at and understand system health within seconds.',
      'Configure at least one alert tied to a specific, justified threshold, and explain why that threshold (not an arbitrary one) was chosen.',
      'Deliberately trigger the alert condition and confirm the alert actually fires.',
    ],
    technologies: ['Prometheus', 'Grafana', 'Or CloudWatch if working in AWS'],
    expectedOutcome: 'A working, tested monitoring setup — not just a dashboard that looks good but has never actually caught anything.',
    constraints: ['Do not alert on every possible metric — an alert should represent something someone should actually act on.'],
    advice: [
      'Before building any alert, write down: "if this fires, what should the on-call person actually do?" If you can\'t answer that, the alert probably shouldn\'t exist yet.',
      'Test your alert by deliberately causing the condition, not just by inspecting the configuration — untested alerts are a well-known source of false confidence.',
    ],
    successCriteria: ['You can trigger the failure condition on demand and watch the alert fire.', 'You can justify every alert threshold with a reason, not a guess.'],
  },
  {
    id: 'proj-devsecops-pipeline', categoryId: 'devsecops', unitName: 'DevSecOps', title: 'Secure a Complete DevOps Pipeline',
    difficulty: 'Advanced', hours: '6-9 hours',
    objective: 'Take an existing CI/CD pipeline (e.g. from your CI/CD project) and harden it against realistic attack scenarios.',
    overview: 'Audit and improve a pipeline\'s security posture across code, dependencies, container images, and credentials — treating the pipeline itself as something that must be defended.',
    requirements: [
      'Add automated dependency scanning that fails the build on known critical vulnerabilities.',
      'Add container image scanning before any image is pushed to a registry.',
      'Audit every credential/secret the pipeline uses and reduce each to the minimum required scope.',
      'Ensure untrusted contributor pull requests cannot access privileged secrets, and demonstrate this is actually enforced, not just assumed.',
      'Document your threat model: what you assumed an attacker could do, and how each control addresses it.',
    ],
    technologies: ['Your existing CI/CD tooling', 'A dependency scanner', 'A container image scanner'],
    expectedOutcome: 'A pipeline where you can point to a specific control for each stage of a realistic attack path, backed by a written threat model.',
    constraints: ['A finding of "critical" severity from your scanners must actually block the pipeline, not just be logged.'],
    advice: [
      'Start by writing the threat model before touching any tooling — "what could go wrong, and how" should drive which controls you add, not the other way around.',
      'Prove enforcement, don\'t assume it: submit a deliberately vulnerable dependency or an over-scoped credential request and confirm your controls actually catch it.',
    ],
    successCriteria: ['A deliberately introduced critical vulnerability is caught and blocks the pipeline.', 'You can explain your full threat model without notes.'],
  },
  {
    id: 'proj-capstone-final', categoryId: 'capstone', unitName: 'Real DevOps Projects', title: 'Final Capstone: End-to-End Production DevOps Environment',
    difficulty: 'Advanced', hours: '15-25 hours',
    objective: 'Combine everything from this curriculum into one coherent, production-style environment, built and defended as a whole system.',
    overview: 'Design and build a single project that touches version control, CI/CD, containerization, infrastructure as code, cloud deployment, orchestration (ECS or Kubernetes), monitoring, and security — as one integrated system, not disconnected exercises.',
    requirements: [
      'Source lives in Git with a real branching/PR workflow.',
      'A CI/CD pipeline tests, builds, and deploys automatically with an approval gate before production.',
      'Infrastructure is defined as code (Terraform) and is fully reproducible from scratch.',
      'The application runs in containers, orchestrated (ECS or Kubernetes), behind a load balancer, across multiple availability zones.',
      'Monitoring and at least one meaningful alert are in place before you consider the project "done."',
      'Security controls (least-privilege IAM, scanned images, no plaintext secrets) are present throughout, not bolted on at the end.',
      'Write a single architecture document that a new engineer could read to understand the entire system.',
    ],
    technologies: ['Git/GitHub', 'CI/CD (GitHub Actions)', 'Docker', 'Terraform', 'AWS', 'ECS or Kubernetes', 'Monitoring stack'],
    expectedOutcome: 'A complete, documented, production-style system you could genuinely defend in a technical interview, end to end, under follow-up questioning.',
    constraints: ['Every component must actually integrate with the others — this is explicitly not a collection of separate unrelated exercises.', 'No manual, undocumented steps outside of version control.'],
    advice: [
      'Build this incrementally in the same order a real team would: source control and CI first, then containerization, then infrastructure, then orchestration, then observability and security hardening layered on top of a working system.',
      'At each stage, write down what you\'d tell an interviewer if asked "why did you make this choice instead of the alternative?" — that\'s the real skill this capstone is testing.',
    ],
    successCriteria: ['You can walk through the entire system, live, from a git commit to a running, monitored, secured production deployment, without gaps.', 'You can justify every major architectural decision under questioning.'],
  },
];
