# Git-time
Estimate time spent on a git repository.

## Install
    npm install -g git-time

## Usage
    git-time <path>

## Help
    Usage: git-time <path>

    Where <path> is the path of your Git repository.
    
    Options:
    
      -h, --help	output usage information
      --max	    	maximum time diff in minutes between two consecultive commits. Default: 90
      --min	    	minimum time in minutes for the start commit. Default: 25
    
    any other param will be appended to the git log command.
      git-time --author=jane.doe@example.com will work
      
      
## Output

Output is grouped by author
```
John Doe <john.doe@example.com>
102 commits found
Total time spent: 103.84 hours

Jane Doe <jane.doe@example.com>
321 commits found
Total time spent: 183.11 hours
```
