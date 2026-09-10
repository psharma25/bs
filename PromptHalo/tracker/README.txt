Task tracker bundle
===================

Made Thu Sep 10 2026 15:25:40 GMT-0400 (Eastern Daylight Time)
By Prv
1 tasks, 3 log entries, 3 people, 0 images.

What is in here
---------------
task-tracker.html      The tracker itself. Open it in a browser.
data/tracker.json      Everything: tasks, subtasks, the full activity log,
                       the people list and the images inline.
exports/tasks.xls      Workbook: tasks, activity, people, SOC 2 coverage.
exports/tasks.tsv      Tab separated, paste straight into a sheet.
exports/activity.tsv   The change history on its own.
images/                Guidance images as real picture files, in a folder
                       per task so you can see which task each belongs to.

How to get the board back
-------------------------
1. Open task-tracker.html.
2. Put your name in, then press Restore, then Choose file.
3. Pick data/tracker.json.
Restoring merges rather than overwrites, so nothing already there is lost.

Note
----
task-tracker.html in this bundle was rebuilt from the running page rather than copied byte for byte, because a page opened straight from disk cannot read its own file. It is a working, empty copy of the tracker: open it and restore data/tracker.json into it.
