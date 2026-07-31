define(['js/lib/binary_heap.js'], function(BinaryHeap) {
    /*
     * @class Astar
     */
    Astar = function(grid) {
        this.grid = grid;
    };
    
    Astar.prototype.search = function(start, end, ignoreType) {
        breadcrumbs = new Map();
        
        g_score = this.infinityMap();
        g_score.set(start.index, 0);
        
        f_score = this.infinityMap();
        f_score.set(start.index, g_score.get(start.index) + start.position.distanceTo(end.position));

        openHeap = new BinaryHeap(function(e) {
            return f_score.get(e.index); 
        });
        closedSet = new Set();
        
        openHeap.push(start);

        while(openHeap.size() > 0) {
            // Grab the lowest f(x) to process next
            var currentNode = openHeap.pop();
            
            if (currentNode == end) {
                return this.reconstruct_path(breadcrumbs, currentNode.index);
            }
            closedSet.add(currentNode);
            
            var neighbors = this.neighbors(currentNode);
            
            neighbors.forEach(function(neighbor) {
                
                if (neighbor.weight > 0 
                    && !closedSet.has(neighbor) 
                    && !neighbor.hasOccupantOfType(ignoreType) ) {

                    potential_g = g_score.get(currentNode.index) + (currentNode.weight - neighbor.weight);
                    
                    if (potential_g >= g_score.get(neighbor.index)) {
                        return;
                    }
                    
                    breadcrumbs.set(neighbor.index, currentNode.index);
                    g_score.set(neighbor.index, potential_g);
                    f_score.set(neighbor.index, g_score.get(neighbor.index) + neighbor.position.distanceTo(end.position));
                    
                    if (!openHeap.has(neighbor)) {
                        openHeap.push(neighbor);
                    }
                }
            });
            
        }

        // No result was found -- null signifies failure to find path
        return null;
    };
    
    Astar.prototype.neighbors = function(currentNode) {
        var x = currentNode.index.x;
        var y = currentNode.index.y;
        var output = [];
        
        //west
        if (this.grid[x-1] && this.grid[x-1][y]) {
            output.push(this.grid[x-1][y]);
        }
        
        //north
        if (this.grid[x] && this.grid[x][y-1]) {
            output.push(this.grid[x][y-1]);
        }
        
        //east
        if (this.grid[x+1] && this.grid[x+1][y]) {
            output.push(this.grid[x+1][y]);
        }
        
        //south
        if (this.grid[x] && this.grid[x][y+1]) {
            output.push(this.grid[x][y+1]);
        }
        
        //northwest
        if (this.grid[x-1] && this.grid[x-1][y-1]) {
            output.push(this.grid[x-1][y-1]);
        }
        
        //northeast
        if (this.grid[x+1] && this.grid[x+1][y+1]) {
            output.push(this.grid[x+1][y+1]);
        }
        
        //southwest
        if (this.grid[x-1] && this.grid[x-1][y+1]) {
            output.push(this.grid[x-1][y+1]);
        }
        
        //southeast
        if (this.grid[x+1] && this.grid[x+1][y-1]) {
            output.push(this.grid[x+1][y-1]);
        }
        
        return output;
    }
    
    Astar.prototype.infinityMap = function() {
        var output = new Map();
        for (var i = 0; i < this.grid.length; i++) {
            for (var j = 0; j < this.grid[i].length; j++) {
                var node = this.grid[i][j];
                output.set(node.index, 10000000);
            }
        }
        
        return output;
    }
    
    Astar.prototype.get_distance = function(current, end) {
        return current.position.distanceTo(end);
    }
    
    Astar.prototype.reconstruct_path = function(breadcrumbs, current) {
        var total_path = [this.grid[current.x][current.y]];
        while (breadcrumbs.has(current)) {
            current = breadcrumbs.get(current);
            total_path.push(this.grid[current.x][current.y]);
        }
        return total_path.reverse();
    }
    
    return Astar;
    
});