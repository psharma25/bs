PromptHalo task tracker
=======================

Layout, keep it as it is:

    task-tracker.html          rename to index.html to make it the folder's default page
    data/
      tracker.json             the board
      snapshots/               dated copies, created automatically

Two places to save, chosen in the bar under the header
------------------------------------------------------
This device      The board stays in this browser on this machine. Nothing is
                 written to disk and nobody else sees it. Works everywhere.

./data folder    The board is written to data/tracker.json beside this page.
                 Press "Choose folder once" and pick the folder this file sits
                 in. After that every change writes there on its own, and the
                 folder is remembered between sessions. Needs Chrome or Edge.

Reading is automatic either way: on open the page fetches ./data/tracker.json
and fills the board in, with no setup and no permission. Commit that file with
the page and everyone who opens it sees the board.
