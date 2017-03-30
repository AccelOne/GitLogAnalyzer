import string

commit_count = 0
authors = []
authors_commits = {}
fix_and_bugs_count = 0
lines_count = 0


def get_counts(log_file):
    gitlog_file = open(log_file, "r", encoding="utf8")
    gitlog_text = gitlog_file.read()
    gitlog_file.close()
    
    commit_count = count_commits(gitlog_text)
    authors = get_authors(gitlog_text)
    authors_commits = get_commits_by_author(gitlog_text, authors)
    fix_and_bugs_count = count_fix_and_bugs(gitlog_text)
    lines_count = count_lines(gitlog_text)
    
    print("Defects every 1000 Lines of code:" + '{0:.1f}'.format(fix_and_bugs_count / lines_count * 1000))
    print("Total commits:" + str(commit_count))
    print("Total project lines:" + str(lines_count))
    print("Bugs / Code Lines ratio:" + '{0:.2f}'.format(fix_and_bugs_count / lines_count * 100) + "%")
    
    print("Number of commits by developer:")
    for author in authors:
        print(author + ":" + str(authors_commits[author]))

    print("Feature Commits:" + str(commit_count - fix_and_bugs_count))
    print("Commits including Fix or Bug:" + str(fix_and_bugs_count))
    print("Bugs / Feature Commits ratio:" + str('{0:.2f}'.format(fix_and_bugs_count / commit_count * 100)) + "%")


def count_commits(gitlog_text):
    commit_count = 0    

    for line in gitlog_text.split('\n'):
        if line.startswith("commit"):
            commit_count+=1

    return commit_count
    
def get_author_name(author_line):
    line_without_label = author_line.split(':')[1]
    author_name = line_without_label.split('<')[0]
    return author_name        

def get_authors(gitlog_text):
    authors = []    

    gitlog_text_local = gitlog_text
    for line in gitlog_text_local.split('\n'):
        if line.startswith("Author"):
            author_name = get_author_name(line)
            if author_name not in authors:
                authors.append(author_name) 
                authors_commits = {author_name: 0}

    return authors

def get_commits_by_author(gitlog_text, authors):
    for author in authors:
        authors_commits[author] = 0 

    for author in authors:
        for line in gitlog_text.split('\n'):
            if line.startswith("Author"):
                author_name = get_author_name(line)
                if author == author_name:
                    authors_commits[author] += 1 
    
    return authors_commits

def count_fix_and_bugs(gitlog_text):
    fix_and_bugs_count = 0    
    index = -1

    lines = gitlog_text.split('\n')
    while index < (len(lines) - 1):
        index += 1
        line = lines[index]
        if line.startswith("Date:"):
            index += 2
            line = lines[index]
            if "FIX" in line.upper() or "BUG" in line.upper(): 
                fix_and_bugs_count += 1        
        pass

    return fix_and_bugs_count

def count_lines(gitlog_text):
    lines_count = 0
    index = -1
    added_lines = 0
    removed_lines = 0

    lines = gitlog_text.split('\n')
    while index < (len(lines) - 1):
        index += 1
        line = lines[index]
        if "files changed" in line:
            parts = line.split(',')
            for part in parts:
                if "insertions" in part:
                    added_lines_str = part.split(' ')[1]
                    added_lines += int(added_lines_str)
                if "deletions" in part:
                    removed_lines_str = part.split(' ')[1]
                    removed_lines += int(removed_lines_str)
    lines_count = added_lines - removed_lines

    return lines_count
