import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel:Model<Pokemon>
  ){}

  

  async create(createPokemonDto: CreatePokemonDto) {

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon;
    } catch (error) {
      if(error.code == 11000){
        throw new BadRequestException(`Pokemon exist in the DB`)
      }
    }

    
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon:Pokemon;

    if(!isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({no:term})
    }

    if(!pokemon && isValidObjectId(term))
    {
      pokemon = await this.pokemonModel.findById(term)
    }

    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name:term})
    }
    if(!pokemon)  throw new NotFoundException(`this pokemon dont exist`);
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

      try {
        const pokemon = await this.findOne(term);

      if(updatePokemonDto.name)
      {
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase()

        await pokemon.updateOne(updatePokemonDto,{new:true});

        return {...pokemon.toJSON(),...updatePokemonDto};

      }
      } catch (error) {
       this.handleErrors(error);
      }
      

  }

  async remove(id: string) {
    const result = await this.pokemonModel.deleteOne({"_id":id});

    const {deletedCount} = result;

    if(deletedCount === 0){
      throw new NotFoundException(`pokemon with id ${id} not found`)
    }
    return;
  }

private handleErrors (error:any){
  console.log(error)
  if(error.code = 11000){
    throw new BadRequestException(`Pokemon exist in the DB ${JSON.stringify(error.KeyValue)}`);
  }
  throw new InternalServerErrorException(`Cant create pokemon - check server logs`);
}
}
