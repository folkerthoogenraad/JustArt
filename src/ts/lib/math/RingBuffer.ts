export class RingBuffer<T> {
    private data: T[];
    private size = 0;
    private index = 0;

    constructor(size: number){
        this.data = [];
        this.size = size;
        this.index = 0;
    }

    clear() {
        this.data = [];
    }
    fill(value: T) {
        for(let i = 0; i < this.data.length; i++){
            this.data[i] = value;
        }

        while(this.data.length < this.size){
            this.push(value);
        }
    }

    push(value: T){
        // Initial filling...
        if(this.data.length < this.size){
            this.data.push(value);
            return;
        }

        this.data[this.index] = value;
        this.index++;
        this.index = this.index % this.data.length;
    }

    get(index: number): T {
        return this.data[this.convertIndex(index)];
    }

    forEach(callback: (item: T, index: number) => void){
        for(let i = 0; i < this.data.length; i++){
            callback(this.get(i), i);
        }
    }

    private convertIndex(index: number): number {
        let i = (index + this.index) % this.data.length;

        if(i < 0){
            i += this.data.length;
        }

        // Asserts 
        if(i < 0 || i >= this.data.length) throw new Error("Assert failed: Wrapping of index failed");

        return i;
    }
}